const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const input = require("input");

// Ganti dengan API ID dan Hash dari https://my.telegram.org
const apiId = 16515869; // ← ganti ini
const apiHash = "40bd864274477f90086570fd0807e3e9"; // ← ganti ini

const stringSession = new StringSession("1BQANOTEuMTA4LjU2LjE3NwG7b131Rt4ERryQ8xlvqqBamdTfQx44fKaDPaHBVjM6o2GMzAhrwKzcbriUG89nDnVmvv1O+ZizWTxIgmJqgbI7w5B/fW2FeftreiXxEAua2XoVoT73Fk/gm2if6AXkVGbWzLy99wk7hhMM22FqC+8auKKhvkEh6itdmt/TIgkDQZYfSyGj8YPd53omdBw5E4PpKmeYSCA+LIVXZ88XBZg7udrN/nO5CNSKNUJ58HOjA1V8gV/RzNg5ylVScgpmNicZ8lH0noNKZwdl4TMcH7aIDW9lKySzDy+k/TD1y8j9XH1Af4TgF4I8eUjTl6zrXr1JwQR/+0//TiJkXGQW/fTR7Q=="); // Biarkan kosong dulu, nanti akan diisi

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
    const message = event.message.message.toLowerCase();
    const sender = await event.message.getSender();
    const name = sender?.firstName || "Teman";

    // Logika statis: jika pesan cocok
    if (message.includes("halo nama kamu siapa")) {
      await event.message.reply({
        message: `Halo, aku akun Telegram-mu yang otomatis. Namaku ${name}.`
      });
    }

    // Kamu bisa tambahkan if-else lain di sini juga
  }, new NewMessage({}));

})();
