// Ganti nama sheet sesuai nama tab di file lu
const CONTACT_SHEET_NAME = "Message"; 
const CHAT_SHEET_NAME = "ChatHistory"; 
const WPM_SHEET_NAME = "WpmLeaderboard"; // Definisikan di atas biar rapi
const ATTACHMENT_FOLDER_NAME = "ContactImages"; // Folder di Google Drive buat simpen upload image
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB limit

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 0. Kalo request JSON (upload image dari form contact)
  // Browser fetch string body default Content-Type text/plain,
  // jadi deteksi lewat isi postData, bukan tipe header.
  if (e.postData && e.postData.contents && e.postData.contents.charAt(0) === '{') {
    return handleJsonPost(e, ss);
  }
  
  var action = e.parameter.action; // Ambil parameter action di awal
  
  // 1. Kalo request ini buat CHAT
  if (action === 'chat') {
    var sheet = ss.getSheetByName(CHAT_SHEET_NAME);
    var senderType = e.parameter.sender;
    var userMessage = e.parameter.message;
    var sessionId = e.parameter.sessionId;
    var isTemplate = e.parameter.isTemplate; 
    
    sheet.appendRow([new Date(), sessionId, senderType, userMessage]);
    
    if (senderType === 'user' && isTemplate !== 'true') {
      var emailTujuan = "riantodwi2002@gmail.com"; 
      var subjectEmail = "💬 Chat Baru di ianoBot!";
      var isiEmail = "Ada yang nge-chat lu di web nih!\n\n" +
                     "Session ID: " + sessionId + "\n" +
                     "Pesan: " + userMessage + "\n\n" +
                     "Buruan buka Spreadsheet lu buat bales:\n" +
                     ss.getUrl();
                     
      MailApp.sendEmail(emailTujuan, subjectEmail, isiEmail);
    }
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Chat saved"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // 2. Kalo request ini buat SAVE WPM (Dipindah ke sini menggunakan else if)
  else if (action === 'save_wpm') {
    var sheet = ss.getSheetByName(WPM_SHEET_NAME); 
    var timestamp = new Date();
    var name = e.parameter.name;
    var wpm = e.parameter.wpm;
    var acc = e.parameter.accuracy;
    
    // Simpen ke kolom A: Waktu, B: Nama, C: WPM, D: Akurasi
    sheet.appendRow([timestamp, name, wpm, acc]);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "WPM score saved"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // 3. Kalo request ini buat CONTACT FORM biasa (Fallback paling terakhir)
  else {
    var sheet = ss.getSheetByName(CONTACT_SHEET_NAME);
    var namaPengirim = e.parameter.nama;
    var emailPengirim = e.parameter.email;
    var pesanPengirim = e.parameter.pesan;
    
    sheet.appendRow([new Date(), namaPengirim, emailPengirim, pesanPengirim]);
    
    var emailTujuan = "riantodwi2002@gmail.com"; 
    var subjectEmail = "📬 Pesan Baru dari Form Contact Web!";
    var isiEmail = "Ada orang yang ngisi form di web lu nih!\n\n" +
                   "Nama  : " + namaPengirim + "\n" +
                   "Email : " + emailPengirim + "\n" +
                   "Pesan : " + pesanPengirim + "\n\n" +
                   "Cek spreadsheet lengkapnya di sini:\n" +
                   ss.getUrl();
                   
    MailApp.sendEmail(emailTujuan, subjectEmail, isiEmail);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── HANDLER KHUSUS: Contact form + upload image (JSON body) ──
function handleJsonPost(e, ss) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    
    if (action === 'upload') {
      var nama = data.nama || "";
      var email = data.email || "";
      var pesan = data.pesan || "";
      var fileName = data.fileName || "attachment.jpg";
      var fileType = data.fileType || "image/jpeg";
      var fileBase64 = data.fileBase64 || "";
      
      if (!fileBase64) {
        return jsonRes({"status": "error", "message": "File kosong"}, 400);
      }
      
      var bytes = Utilities.base64Decode(fileBase64);
      if (bytes.length > MAX_IMAGE_BYTES) {
        return jsonRes({"status": "error", "message": "File kegedean, max 5MB"}, 400);
      }
      
      // Whitelist tipe file biar ga bisa upload file sembarangan
      var allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (allowedTypes.indexOf(fileType) === -1) {
        return jsonRes({"status": "error", "message": "Tipe file ga didukung"}, 400);
      }
      
      // Simpen ke Google Drive (folder ContactImages)
      var folder = getOrCreateFolder_(ATTACHMENT_FOLDER_NAME);
      var blob = Utilities.newBlob(bytes, fileType, fileName);
      var file = folder.createFile(blob);
      var fileUrl = file.getUrl();
      
      // Simpen ke sheet: kolom E = Nama File, F = URL Drive
      var sheet = ss.getSheetByName(CONTACT_SHEET_NAME);
      sheet.appendRow([new Date(), nama, email, pesan, fileName, fileUrl]);
      
      var emailTujuan = "riantodwi2002@gmail.com"; 
      var subjectEmail = "📎 Pesan + Gambar dari Form Contact Web!";
      var isiEmail = "Ada orang ngirim pesan SEKALIGUS gambar di web lu!\n\n" +
                     "Nama   : " + nama + "\n" +
                     "Email  : " + email + "\n" +
                     "Pesan  : " + pesan + "\n" +
                     "File   : " + fileName + "\n" +
                     "Drive  : " + fileUrl + "\n\n" +
                     "Cek spreadsheet lengkapnya di sini:\n" +
                     ss.getUrl();
                     
      MailApp.sendEmail(emailTujuan, subjectEmail, isiEmail);
      
      return jsonRes({"status": "success", "message": "Uploaded", "url": fileUrl});
    }
    
    return jsonRes({"status": "error", "message": "Action JSON ga dikenal"}, 400);
  } catch (err) {
    return jsonRes({"status": "error", "message": "Server error: " + err.message}, 500);
  }
}

function getOrCreateFolder_(name) {
  var it = DriveApp.getFoldersByName(name);
  if (it.hasNext()) return it.next();
  return DriveApp.createFolder(name);
}

function jsonRes(obj, code) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle fungsi ngambil data (Load Chat & Load Leaderboard)
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // ── LOGIC CHAT HISTORY (Existing) ──
  if (e.parameter.action === 'getChat') {
    var sheet = ss.getSheetByName(CHAT_SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    var sessionId = e.parameter.sessionId;
    var history = [];

    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === sessionId) {
        history.push({ 
          sender: data[i][2], 
          message: data[i][3] 
        });
      }
    }
    return ContentService.createTextOutput(JSON.stringify(history)).setMimeType(ContentService.MimeType.JSON);
  }
  
  // ── TAMBAHAN LOGIC: AMBIL TOP 5 LEADERBOARD WPM ──
  else if (e.parameter.action === 'get_leaderboard') {
    var sheet = ss.getSheetByName("WpmLeaderboard");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON); // Kosong kalo cuma ada header
    
    var scores = [];
    // Loop mulai dari baris kedua (skip header)
    for (var i = 1; i < data.length; i++) {
      scores.push({
        name: data[i][1],
        wpm: parseFloat(data[i][2]) || 0,
        accuracy: data[i][3]
      });
    }
    
    // Sort berdasarkan WPM tertinggi ke terendah
    scores.sort(function(a, b) { return b.wpm - a.wpm; });
    
    // Ambil top 5 aja biar ga kepenuhan
    var topScores = scores.slice(0, 5);
    
    return ContentService.createTextOutput(JSON.stringify(topScores)).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput("Endpoint Active");
}
