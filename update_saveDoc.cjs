const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldSaveDoc = `  const saveDoc = () => {
    if (!checkPerm("manageDocs", "رفع مستند")) return;
    if (!form.name) return;
    setDocs([...docs, { id: nextId(docs), name: form.name, type: form.type || DOC_TYPES[0], caseId: form.caseId ? +form.caseId : null, date: todayISO(), by: currentUser.name }]);
    setModal(null);
  };`;

const newSaveDoc = `  const saveDoc = async () => {
    if (!checkPerm("manageDocs", "رفع مستند")) return;
    if (!form.name) return;

    let isEncrypted = false;
    let iv = undefined;
    let mimeType = undefined;
    let fileUrl = undefined;

    if (form.fileObj) {
      setDocUploading(true);
      try {
        const file = form.fileObj as File;
        mimeType = file.type;
        const { encryptedBlob, ivHex } = await encryptFile(file);
        iv = ivHex;
        isEncrypted = true;

        const fileExt = file.name.split('.').pop() || 'bin';
        const fileName = \`encrypted_docs/\${Date.now()}-\${Math.random().toString(36).substring(7)}.\${fileExt}\`;
        
        const { error } = await supabase.storage.from("documents").upload(fileName, encryptedBlob, {
            contentType: 'application/octet-stream'
        });

        if (error) {
           console.warn("Supabase upload failed, fallback to ObjectURL:", error);
           fileUrl = URL.createObjectURL(encryptedBlob);
        } else {
           fileUrl = fileName; 
        }
      } catch (e) {
        console.error("Encryption/Upload failed:", e);
        alert("حدث خطأ أثناء تشفير أو رفع الملف.");
        setDocUploading(false);
        return;
      }
      setDocUploading(false);
    }

    setDocs([...docs, { 
      id: nextId(docs), 
      name: form.name, 
      type: form.type || DOC_TYPES[0], 
      caseId: form.caseId ? +form.caseId : null, 
      date: todayISO(), 
      by: currentUser.name,
      isEncrypted,
      iv,
      mimeType,
      fileUrl
    }]);
    setModal(null);
  };

  const handleDownloadDoc = async (d: DocItem) => {
    if (!d.fileUrl) {
      alert("هذا المستند لا يحتوي على ملف مرفق.");
      return;
    }
    
    if (d.isEncrypted && d.iv && d.mimeType) {
      try {
        let encryptedBlob: Blob;
        if (d.fileUrl.startsWith("blob:")) {
          const res = await fetch(d.fileUrl);
          encryptedBlob = await res.blob();
        } else {
          const { data, error } = await supabase.storage.from("documents").download(d.fileUrl);
          if (error || !data) throw error;
          encryptedBlob = data;
        }

        const decryptedBlob = await decryptFile(encryptedBlob, d.iv, d.mimeType);
        const url = URL.createObjectURL(decryptedBlob);
        window.open(url, "_blank");
      } catch (e) {
        console.error("Decryption failed:", e);
        alert("حدث خطأ أثناء فك تشفير الملف. تأكد من صلاحياتك.");
      }
    } else {
      window.open(d.fileUrl, "_blank");
    }
  };`;

content = content.replace(oldSaveDoc, newSaveDoc);
fs.writeFileSync('src/App.tsx', content);
