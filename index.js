const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const input = require("input");
const axios = require("axios"); // Import axios
require("dotenv").config();

// Ganti dengan API ID dan Hash dari https://my.telegram.org
const apiId = Number(process.env.API_ID); // ← ganti ini
const apiHash = process.env.API_HASH; // ← ganti ini

// Ganti dengan API Key Gemini Anda
// Petunjuk: https://cloud.google.com/gemini/docs/authentication/api-keys
const geminiApiKey = process.env.GEMINI_API_KEY; // ← Ganti ini

const stringSession = new StringSession(process.env.SESI_TELE); // Biarkan kosong dulu, nanti akan diisi

(async () => {
  console.log("📲 Login akun Telegram kamu...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Nomor HP kamu (dengan kode negara): "),
    password: async () => await input.text("Password 2FA (jika ada): "),
    phoneCode: async () => await input.text("Masukkan kode OTP dari Telegram: "),
    onError: (err) => console.error(err),
  });

  console.log("✅ Login berhasil!");
  console.log("🔐 Simpan session string ini agar tidak login ulang:");
  console.log(client.session.save());

  // Dengarkan semua pesan masuk
  client.addEventHandler(async (event) => {
    // Pastikan itu adalah pesan teks dan bukan dari bot itu sendiri
    if (event.message && event.message.message && !event.message.out) {
      const userMessage = event.message.message;
      const sender = await event.message.getSender();
      const name = sender?.firstName || "Teman";

      console.log(`Pesan dari ${name}: ${userMessage}`);

      // Anda bisa menambahkan logika untuk memfilter pesan tertentu yang ingin Anda kirim ke Gemini
      // Misalnya, hanya jika pesan dimulai dengan 'bot '
      if (userMessage.toLowerCase().startsWith("san ")) {
        const query = userMessage.substring(4).trim(); // Ambil teks setelah 'bot '

        try {
          // add setTyping
          await client.invoke(
            new Api.messages.SetTyping({
              peer: sender,
              action: new Api.SendMessageTypingAction(),
            })
          );

          const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
            {
              contents: [{ parts: [{ text: query }] }],
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const geminiReply = response.data.candidates[0].content.parts[0].text;
          await event.message.reply({ message: geminiReply });
          // console.log(geminiReply);
        } catch (error) {
          console.error("Error calling Gemini API:", error.response ? error.response.data : error.message);
          await event.message.reply({ message: "Maaf, ada masalah saat menghubungi Gemini AI." });
        }
      } else {
        // Logika statis yang sudah ada, jika tidak ditangani oleh Gemini
        if (userMessage.toLowerCase().includes("halo nama kamu siapa")) {
          await event.message.reply({ message: `Halo, aku akun Telegram-mu yang otomatis. Namaku ${name}.` });
        }
      }
    }
  }, new NewMessage({}));

})();