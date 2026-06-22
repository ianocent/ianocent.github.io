lu bisa copas aja langsung ke Apps Script lu, ganti emailnya, atau kalo mau disesuain lagi juga boleh
// Ganti nama sheet sesuai nama tab di file lu
const CONTACT_SHEET_NAME = "Message"; 
const CHAT_SHEET_NAME = "ChatHistory"; 

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Kalo request ini buat CHAT
  if (e.parameter.action === 'chat') {
    var sheet = ss.getSheetByName(CHAT_SHEET_NAME);
    var senderType = e.parameter.sender;
    var userMessage = e.parameter.message;
    var sessionId = e.parameter.sessionId;
    var isTemplate = e.parameter.isTemplate; // <-- PENANDA CHAT TEMPLATE
    
    // 1. Simpen data ke sheet
    sheet.appendRow([new Date(), sessionId, senderType, userMessage]);
    
    // 2. LOGIC NOTIFIKASI EMAIL (Ngirim email kalo 'user' DAN BUKAN dari template)
    if (senderType === 'user' && isTemplate !== 'true') {
      var emailTujuan = "mail@lu.com"; 
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
  
  // Kalo request ini buat CONTACT FORM biasa
  else {
    var sheet = ss.getSheetByName(CONTACT_SHEET_NAME);
    var namaPengirim = e.parameter.nama;
    var emailPengirim = e.parameter.email;
    var pesanPengirim = e.parameter.pesan;
    
    sheet.appendRow([new Date(), namaPengirim, emailPengirim, pesanPengirim]);
    
    var emailTujuan = "mail@lu.com"; 
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

// Handle fungsi ngambil riwayat chat (Load Chat)
function doGet(e) {
  if (e.parameter.action === 'getChat') {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CHAT_SHEET_NAME);
    var data = sheet.getDataRange().getValues();
    var sessionId = e.parameter.sessionId;
    var history = [];

    // Mulai dari 1 buat nge-skip baris Header
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === sessionId) {
        history.push({ 
          sender: data[i][2], 
          message: data[i][3] 
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify(history))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput("Endpoint Active");
}
