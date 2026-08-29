const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetState = `  const [isSecureBlurred, setIsSecureBlurred] = useState(false);`;
const addState = `  const [firmLetterhead, setFirmLetterhead] = useState<string | null>(() => loadStorage("firm_letterhead", null));
  const [firmStamp, setFirmStamp] = useState<string | null>(() => loadStorage("firm_stamp", null));
  const [userSignature, setUserSignature] = useState<string | null>(() => loadStorage("user_signature_" + currentUser.id, null));
  
  useEffect(() => {
    setUserSignature(loadStorage("user_signature_" + currentUser.id, null));
  }, [currentUser]);`;

if (code.includes(targetState) && !code.includes('firmLetterhead')) {
  code = code.replace(targetState, targetState + '\n' + addState);
  fs.writeFileSync('src/App.tsx', code);
  console.log("States added.");
} else {
  console.log("Not found or already added.");
}
