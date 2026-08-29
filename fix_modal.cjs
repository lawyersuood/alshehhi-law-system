const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetState = `  const [isSecureBlurred, setIsSecureBlurred] = useState(false);
  useEffect(() => {
    if (modal === "delegation-preview") {
      logAuditAction("VIEW", "الحقيبة الخاصة", "عرض مستند رسمي", "تم فتح مستند الإنابة للعرض", 0);
      
      const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'c' || e.key === 'P' || e.key === 'S' || e.key === 'C')) {
          e.preventDefault();
          alert("غير مصرح: تم تسجيل محاولة استخدام اختصار محظور.");
          logAuditAction("SECURITY_ALERT", "الحقيبة الخاصة", "محاولة نسخ/طباعة", \`محاولة اختصار \${e.key}\`, 0);
        }
      };
      
      const handleBlur = () => { setIsSecureBlurred(true); };
      const handleFocus = () => { setIsSecureBlurred(false); };
      const handleVisibility = () => { if (document.hidden) setIsSecureBlurred(true); else setIsSecureBlurred(false); };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('blur', handleBlur);
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibility);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('blur', handleBlur);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    } else {
      setIsSecureBlurred(false);
    }
  }, [modal]);
`;

code = code.replace(targetState, '');

const modalStart = `  const [modal, setModal] = useState<string | null>(null);`;
code = code.replace(modalStart, modalStart + '\n' + targetState);

fs.writeFileSync('src/App.tsx', code);
