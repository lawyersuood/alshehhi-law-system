import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  /**
   * عنوان مختصر لسياق الخطأ (مثلاً اسم الشاشة) يظهر للمستخدم لمساعدته على وصف المشكلة عند التواصل مع الدعم.
   */
  context?: string;
  /**
   * عند التعطل، يمكن عرض واجهة أصغر (مناسبة لشاشة فرعية) بدل شاشة كاملة (مناسبة للجذر).
   */
  variant?: "full" | "inline";
  /**
   * أي تغيّر بهذه القيمة (مثلاً التبويب النشط) يعيد تصفير حالة الخطأ تلقائياً — يُستخدم بدل
   * الاعتماد على prop الخاص "key" لتفادي مشاكل الأنواع المعروفة في هذا المشروع (راجع التعليق
   * في القسم الرابع من تقرير المراجعة: غياب @types/react).
   */
  resetKey?: string | number;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * حاجز أخطاء (Error Boundary) — يمنع انهيار الواجهة بالكامل (شاشة بيضاء) عند وقوع خطأ برمجي
 * غير متوقع في أي مكوّن فرعي. بدل الشاشة البيضاء، يعرض رسالة عربية واضحة وزر لإعادة المحاولة.
 *
 * ملاحظة: هذا لا "يصلح" الخطأ نفسه، بل يحتوي أثره فقط بحيث لا يفقد المستخدم عمله بالكامل
 * ويعرف ماذا حدث. أي خطأ يظهر هنا بشكل متكرر يستحق تشخيصاً منفصلاً لسببه الجذري.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console -- تسجيل مقصود لتشخيص الأخطاء غير المتوقعة في الإنتاج
    console.error(
      `[ErrorBoundary${this.props.context ? `: ${this.props.context}` : ""}]`,
      error,
      errorInfo,
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    // إعادة تصفير تلقائية لحالة الخطأ عند تغيّر resetKey (مثلاً عند تبديل التبويب/الشاشة)،
    // حتى لا يبقى المستخدم عالقاً في شاشة الخطأ بعد الانتقال لمكان آخر بالتطبيق.
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isInline = this.props.variant === "inline";

    return (
      <div
        className={
          isInline
            ? "flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 p-8 text-center"
            : "flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-8 text-center"
        }
        dir="rtl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle size={24} className="text-red-600" />
        </div>
        <div className="max-w-md space-y-1">
          <h2 className="text-lg font-bold text-gray-900">
            حدث خطأ غير متوقع{this.props.context ? ` في ${this.props.context}` : ""}
          </h2>
          <p className="text-sm text-gray-600">
            نعتذر عن الإزعاج. لم يتم فقدان بياناتك المحفوظة. يمكنك إعادة المحاولة، وإذا تكررت
            المشكلة يرجى التواصل مع الدعم الفني مع ذكر الشاشة التي كنت تستخدمها.
          </p>
        </div>
        <button
          type="button"
          onClick={this.handleRetry}
          className="flex items-center gap-2 rounded-lg bg-[#0D382B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a2c22]"
        >
          <RotateCcw size={16} />
          إعادة المحاولة
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
