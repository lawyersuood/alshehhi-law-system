-- ============================================================================
-- ترحيل المرحلة الرابعة: تفعيل الأدوار والصلاحيات على مستوى قاعدة البيانات (RLS حقيقي)
-- ============================================================================
-- هذا الملف **لا يُطبَّق تلقائياً** — يجب نسخه ولصقه وتشغيله يدوياً من لوحة تحكم Supabase:
--   Database → SQL Editor → New query → الصق كامل الملف → Run
--
-- ⚠️ تحذير مهم جداً قبل التشغيل — اقرأ هذا أولاً حتى لا يُقفَل عليك دخولك الخاص كمالك النظام:
-- ----------------------------------------------------------------------------
-- هذا الملف يضيف قيوداً حقيقية تمنع أي مستخدم (عدا "admin") من تغيير دوره أو دور غيره عبر
-- قاعدة البيانات مباشرة. إن لم يكن لحسابك الشخصي (بريد المالك) صف بدور 'admin' في جدول
-- public.profiles *قبل* تشغيل بقية الملف، فقد تفقد القدرة على ترقية نفسك لاحقاً من داخل
-- التطبيق (لأن الترقية عبر الواجهة تمر بنفس القيد). لذلك:
--
--   الخطوة صفر (نفّذها بمفردك، مرة واحدة، قبل أي شيء آخر في هذا الملف):
--   ١) اذهب إلى Authentication → Users في لوحة تحكم Supabase وانسخ الـ UUID الخاص بحسابك
--      (بريد مالك المكتب، مثال: info@lawyersuood.com).
--   ٢) نفّذ هذا الاستعلام بمفرده أولاً (عدّل البريد الإلكتروني والـ UUID إن لزم):
--
--      insert into public.profiles (id, email, full_name, role, role_title, status, permissions)
--      values (
--        '<ضع هنا UUID حساب المالك من Authentication → Users>',
--        'info@lawyersuood.com',
--        'مدير النظام',
--        'admin',
--        'مدير النظام',
--        'approved',
--        '{}'::jsonb
--      )
--      on conflict (id) do update set
--        role = 'admin', role_title = 'مدير النظام', status = 'approved';
--
--   فقط بعد التأكد من نجاح هذا الاستعلام (تحقق: select * from public.profiles where role='admin';)
--   تابع بتشغيل بقية هذا الملف دفعة واحدة.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- قرار التصميم المتبع في هذه الدفعة (موثّق هنا لأنه قرار هندسي مهم يخالف الخطة الأصلية المقترحة):
-- ----------------------------------------------------------------------------
-- كانت الخطة الأصلية تقترح إنشاء جدول جديد باسم app_users. لكن عند مراجعة الكود الفعلي
-- (src/App.tsx) تبيّن أن جدولاً مركزياً باسم public.profiles **موجود بالفعل ومُستخدم فعلياً**:
--   - يُقرأ منه ويُكتب إليه عند كل تسجيل دخول (fetchSupabaseProfiles)
--   - يُكتب إليه عند إنشاء/تعديل مستخدم من شاشة المستخدمين (UserModal → App.tsx)
--   - يُستخدم فعلياً لتدفق "طلب حساب جديد بانتظار موافقة المدير" (status: pending/approved)
--   - عموده `id` هو نفسه uuid المستخدم في Supabase Auth (auth.users.id) — تم التأكد من هذا
--     من مسار الموافقة على المستخدمين (confirmApproveUser) الذي يحدّث الصف بمطابقة
--     `id = auth_user_id`.
-- إنشاء جدول app_users منفصل كان سيُنشئ مصدرين للحقيقة عن نفس البيانات (profiles و app_users)
-- بلا أي آلية مزامنة بينهما، وهي بالضبط المشكلة التي يحاول هذا الترحيل حلّها. لذلك تم اتخاذ قرار
-- هندسي بالبناء على الجدول الموجود profiles وتقويته بدل تكراره. تفاصيل كاملة في
-- PHASE4_ROLES_MIGRATION.md.
-- ----------------------------------------------------------------------------

-- 1) التأكد من وجود كل الأعمدة المطلوبة على public.profiles (إن كان الجدول موجوداً مسبقاً بأعمدة
--    أقل، أو إن لم يكن موجوداً إطلاقاً في مشروعك — الأوامر أدناه آمنة للتكرار IF NOT EXISTS).
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid() references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  phone text,
  role text not null default 'no_access',
  role_title text not null default 'بدون صلاحيات خاصة',
  permissions jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists role text not null default 'no_access';
alter table public.profiles add column if not exists role_title text not null default 'بدون صلاحيات خاصة';
alter table public.profiles add column if not exists permissions jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists status text not null default 'pending';
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- تحديث updated_at تلقائياً عند أي تعديل
create or replace function public.set_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_profiles_updated_at();

-- ----------------------------------------------------------------------------
-- 2) منع تصعيد الصلاحيات (Privilege escalation): لا يستطيع أي مستخدم تغيير دوره أو دور غيره
--    (role / role_title / permissions) إلا إذا كان هو نفسه صاحب دور 'admin' حالياً في الجدول.
--    هذا القيد يعمل عبر Trigger (وليس RLS policy فقط) لأنه يحتاج مقارنة القيمة القديمة بالجديدة
--    بدقة، وهو أضمن من الاعتماد فقط على فحص الواجهة الأمامية (checkPerm('manageUsers')) الذي
--    يمكن تجاوزه بسهولة بأي طلب مباشر لواجهة Supabase.
--    ملاحظة: يُستثنى من هذا القيد أي اتصال لا يحمل جلسة مستخدم حقيقية (auth.uid() فارغ) — أي
--    اتصال SQL Editor المباشر لصاحب المشروع، أو الخادم عبر service-role key — لضمان عدم قفل
--    المالك نفسه خارج قدرته على الإصلاح اليدوي عند الحاجة.
create or replace function public.enforce_profile_role_security()
returns trigger as $$
declare
  requester_role text;
begin
  -- لا قيد على اتصالات بلا جلسة مستخدم (SQL Editor المباشر / service-role من الخادم)
  if auth.uid() is null then
    return new;
  end if;

  select role into requester_role from public.profiles where id = auth.uid();

  if requester_role is distinct from 'admin' then
    if tg_op = 'INSERT' then
      -- أي تسجيل جديد (ذاتي التسجيل من شاشة الدخول) يُجبر دائماً على أدنى صلاحية ممكنة وحالة
      -- "قيد الانتظار"، بصرف النظر عمّا أرسله المتصفح — لا يمكن لأحد منح نفسه دوراً عند التسجيل.
      new.role := 'no_access';
      new.role_title := 'بدون صلاحيات خاصة (بانتظار مراجعة المدير)';
      new.permissions := '{}'::jsonb;
      new.status := 'pending';
    elsif tg_op = 'UPDATE' then
      -- تعديل مستخدم غير admin لصفه الخاص: يُسمح بتحديث بياناته الأساسية (الاسم/الهاتف) فقط،
      -- وتُعاد قيم الدور/الصلاحيات/الحالة لقيمتها القديمة كما كانت قبل الطلب مهما حاول تعديلها.
      new.role := old.role;
      new.role_title := old.role_title;
      new.permissions := old.permissions;
      new.status := old.status;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_enforce_profile_role_security on public.profiles;
create trigger trg_enforce_profile_role_security
  before insert or update on public.profiles
  for each row execute function public.enforce_profile_role_security();

-- ----------------------------------------------------------------------------
-- 3) تفعيل RLS وسياساته على profiles
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select
  using (auth.role() = 'authenticated');

drop policy if exists "profiles_insert_own_or_admin" on public.profiles;
create policy "profiles_insert_own_or_admin"
  on public.profiles for insert
  with check (
    auth.role() = 'authenticated'
    and (id = auth.uid() or id is null or
         exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  );

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (
    auth.role() = 'authenticated'
    and (id = auth.uid() or
         exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  );

drop policy if exists "profiles_delete_admin_only" on public.profiles;
create policy "profiles_delete_admin_only"
  on public.profiles for delete
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ملاحظة عن السماح بـ anon على INSERT (تسجيل حساب جديد من شاشة الدخول قبل أي جلسة موثّقة):
-- التسجيل الذاتي في التطبيق يحدث أحياناً قبل إنشاء جلسة Supabase Auth فعلية للمستخدم الجديد
-- (راجع onRegister في src/App.tsx). إن كان هذا يفشل بعد هذا الترحيل بسبب auth.role() != 'authenticated'،
-- فالحل الآمن هو ألا يتم إدراج الصف إلا بعد نجاح supabase.auth.signUp (أي بعد وجود جلسة authenticated)،
-- وليس إضافة سياسة تسمح لـ anon الكتابة المباشرة في جدول الأدوار.

-- ============================================================================
-- 4) سياسات RLS حقيقية معتمدة على الدور لأكثر الجداول حساسية (بدل authenticated العامة فقط)
--    هذه هي القدرة الجديدة التي أصبحت ممكنة الآن بعد وجود جدول أدوار مركزي موثوق.
-- ============================================================================

-- تفعيل RLS على الجداول الثلاثة (لا يؤثر إن كان مفعّلاً مسبقاً)
alter table if exists public.str_reports enable row level security;
alter table if exists public.disciplinary_actions enable row level security;
alter table if exists public.trust_transactions enable row level security;

-- --- str_reports: تقارير الاشتباه (مكافحة غسل الأموال) — أعلى حساسية وسرية قانونية.
-- يُسمح فقط لدور admin أو supervisor (مسؤول الامتثال/المدير) بالقراءة والكتابة.
drop policy if exists "str_reports_admin_supervisor_all" on public.str_reports;
create policy "str_reports_admin_supervisor_all"
  on public.str_reports for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'supervisor') and p.status = 'approved'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'supervisor') and p.status = 'approved'
    )
  );

-- --- disciplinary_actions: إجراءات تأديبية بحق الموظفين — بيانات موارد بشرية حساسة.
-- يُسمح فقط لدور admin (مدير/HR) بالقراءة والكتابة.
drop policy if exists "disciplinary_actions_admin_only" on public.disciplinary_actions;
create policy "disciplinary_actions_admin_only"
  on public.disciplinary_actions for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'approved'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'approved'
    )
  );

-- --- trust_transactions: حركات الحساب الائتماني/الأمانات — أعلى حساسية مالية.
-- القراءة متاحة لأي مستخدم موثّق (authenticated) كما كانت، لكن الكتابة (INSERT/UPDATE/DELETE)
-- مقصورة على admin أو accountant فقط، تماشياً مع توصية RLS_CHECKLIST.md الأصلية.
drop policy if exists "trust_transactions_select_authenticated" on public.trust_transactions;
create policy "trust_transactions_select_authenticated"
  on public.trust_transactions for select
  using (auth.role() = 'authenticated');

drop policy if exists "trust_transactions_write_admin_accountant" on public.trust_transactions;
create policy "trust_transactions_write_admin_accountant"
  on public.trust_transactions for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'accountant') and p.status = 'approved'
    )
  );

drop policy if exists "trust_transactions_update_admin_accountant" on public.trust_transactions;
create policy "trust_transactions_update_admin_accountant"
  on public.trust_transactions for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'accountant') and p.status = 'approved'
    )
  );

drop policy if exists "trust_transactions_delete_admin_accountant" on public.trust_transactions;
create policy "trust_transactions_delete_admin_accountant"
  on public.trust_transactions for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'accountant') and p.status = 'approved'
    )
  );

-- ============================================================================
-- 5) ملاحظة أخيرة مهمة — لا يوجد ترحيل تلقائي للمستخدمين الحاليين
-- ============================================================================
-- بيانات أدوار المستخدمين الحاليين (قبل هذا التحديث) كانت مخزّنة محلياً في متصفح كل مستخدم
-- (localStorage) فقط، وليس هناك أي وسيلة برمجية معروفة لهذا الترحيل لتحديد الدور "الصحيح"
-- الذي يجب أن يحصل عليه كل مستخدم حالي تلقائياً. لذلك:
--   - أي مستخدم ليس له صف في profiles بعد هذا التحديث سيُنشأ له صف تلقائياً بدور 'no_access'
--     (بدون أي صلاحيات خاصة) عند أول دخول له بعد نشر هذا التحديث — وليس admin أبداً.
--   - **على مالك المكتب (بعد تنفيذ الخطوة صفر أعلاه لحسابه فقط) الدخول لشاشة "المستخدمون"
--     وإعادة إسناد الدور الصحيح يدوياً لكل مستخدم حقيقي حالي (محامٍ، محاسب، سكرتير...)، لأن لا
--     طريقة تلقائية آمنة لمعرفة الدور المقصود لكل حساب سابق.**
-- ============================================================================
