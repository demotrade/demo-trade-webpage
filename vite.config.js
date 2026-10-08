import { defineConfig } from 'vite';
import nodemailer from 'nodemailer';

export default defineConfig({
  plugins: [
    {
      name: 'smtp-mail-sender-plugin',
      configureServer(server) {
        server.middlewares.use('/api/send-email', async (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
              try {
                const data = JSON.parse(body);

                if (!data.name || !data.email || !data.message) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ success: false, message: 'Kérjük töltse ki a kötelező mezőket!' }));
                }

                // Spam Bot Honeypot check
                if (data.honeypot) {
                  console.warn('Bot submission blocked via Honeypot trap.');
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ success: true, message: 'Köszönjük! Üzenetét sikeresen továbbítottuk e-mailben.' }));
                }

                // GDPR Privacy consent check
                if (data.privacyConsent === false) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ success: false, message: 'Kérjük fogadja el az Adatkezelési tájékoztatót!' }));
                }

                // SMTP configuration from user credentials
                const transporter = nodemailer.createTransport({
                  host: 'smtp.gmail.com',
                  port: 465,
                  secure: true,
                  auth: {
                    user: 'demotradekft@gmail.com',
                    pass: 'cjjxniblpeyetuvm'
                  }
                });

                const recipient = process.env.RECIPIENT_EMAIL || 'gava.tibor74@gmail.com';
                const { name, email, phone, subject, message, position, productName, type = 'contact', attachment } = data;

                let mailSubject = `[Demo-Trade Kapcsolat] - ${subject || 'Új érdeklődés'}`;
                let headerTitle = 'Új üzenet érkezett a Demo-Trade weboldalról!';
                let headerBadge = 'Kapcsolatfelvétel';
                let extraRows = '';

                if (type === 'career') {
                  mailSubject = `[Demo-Trade Karrier] - ${position || 'Általános jelentkezés'} - ${name}`;
                  headerTitle = 'Új állásjelentkezés érkezett a Demo-Trade karrier oldalról!';
                  headerBadge = 'Álláspályázat & Önéletrajz';
                  extraRows = `
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; width: 160px;">Megpályázott pozíció:</td>
                      <td style="padding: 8px 0; color: #2d7d46; font-weight: bold; font-size: 16px;">${position || 'Általános jelentkezés'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold;">Csatolt önéletrajz:</td>
                      <td style="padding: 8px 0; font-weight: bold; color: #f27922;">${attachment && attachment.filename ? attachment.filename : 'Nincs csatolva'}</td>
                    </tr>
                  `;
                } else if (type === 'product') {
                  mailSubject = `[Demo-Trade Termék] - ${productName || 'Termék érdeklődés'} - ${name}`;
                  headerTitle = 'Új termék érdeklődés érkezett a Demo-Trade weboldalról!';
                  headerBadge = 'Termékajánlat Kérés';
                  extraRows = `
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; width: 160px;">Érintett termék:</td>
                      <td style="padding: 8px 0; color: #f27922; font-weight: bold; font-size: 16px;">${productName || 'Általános termék érdeklődés'}</td>
                    </tr>
                  `;
                } else {
                  extraRows = `
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; width: 160px;">Téma / Szolgáltatás:</td>
                      <td style="padding: 8px 0; color: #f27922; font-weight: bold;">${subject || 'Általános érdeklődés'}</td>
                    </tr>
                  `;
                }

                const mailOptions = {
                  from: `"Demo-Trade Weboldal" <demotradekft@gmail.com>`,
                  to: recipient,
                  replyTo: `"${name}" <${email}>`,
                  subject: mailSubject,
                  html: `
                    <div style="font-family: Arial, sans-serif; padding: 25px; color: #1e293b; max-width: 650px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                      <div style="background: linear-gradient(135deg, #0f172a, #2d7d46); padding: 20px; border-radius: 8px; color: #ffffff; margin-bottom: 20px;">
                        <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">${headerBadge}</span>
                        <h2 style="margin: 10px 0 0 0; font-size: 22px; color: #ffffff;">${headerTitle}</h2>
                      </div>
                      
                      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 8px 0; font-weight: bold; width: 160px;">Küldő neve:</td>
                          <td style="padding: 8px 0; font-size: 15px; font-weight: 600;">${name}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: bold;">E-mail cím:</td>
                          <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2d7d46; font-weight: bold;">${email}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: bold;">Telefonszám:</td>
                          <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #1e293b; font-weight: 600; text-decoration: none;">${phone || 'Nincs megadva'}</a></td>
                        </tr>
                        ${extraRows}
                      </table>

                      <div style="padding: 18px; background-color: #f8fafc; border-left: 4px solid #2d7d46; border-radius: 6px; margin-bottom: 20px;">
                        <h4 style="margin-top: 0; color: #0f172a;">${type === 'career' ? 'Motivációs üzenet / Bemutatkozás:' : 'Üzenet tartalma:'}</h4>
                        <p style="white-space: pre-wrap; font-size: 15px; line-height: 1.6; margin-bottom: 0;">${message}</p>
                      </div>

                      ${attachment && attachment.filename ? `
                        <div style="padding: 12px 16px; background: #eef8f1; border: 1px solid #c2e7cc; border-radius: 6px; margin-bottom: 20px; font-size: 14px; color: #2d7d46;">
                          📎 <strong>Csatolmány mellékelve:</strong> ${attachment.filename}
                        </div>
                      ` : ''}

                      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                      <p style="font-size: 12px; color: #64748b; text-align: center;">Demo-Trade Kft. - Automatikus Értesítő Rendszer</p>
                    </div>
                  `
                };

                if (attachment && attachment.content) {
                  mailOptions.attachments = [
                    {
                      filename: attachment.filename || 'oneletrajz.pdf',
                      content: attachment.content,
                      encoding: 'base64',
                      contentType: attachment.contentType || 'application/pdf'
                    }
                  ];
                }

                await transporter.sendMail(mailOptions);

                // 2. Automatikus diplomatikus visszaigazoló e-mail küldése a jelentkezőnek (ha karrier jelentkezés)
                if (type === 'career' && email) {
                  try {
                    const submissionTime = new Date().toLocaleString('hu-HU', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Europe/Budapest'
                    });

                    const confirmationMailOptions = {
                      from: `"Demo-Trade Kft. Karrier" <demotradekft@gmail.com>`,
                      to: email,
                      subject: `[Demo-Trade Kft.] Jelentkezés sikeres visszaigazolása - ${position || 'Álláspályázat'}`,
                      html: `
                        <div style="font-family: Arial, sans-serif; padding: 25px; color: #1e293b; max-width: 650px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                          <div style="background: linear-gradient(135deg, #0f172a 0%, #2d7d46 100%); padding: 24px; border-radius: 8px; color: #ffffff; margin-bottom: 24px; text-align: center;">
                            <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; margin-bottom: 8px;">Jelentkezés Visszaigazolás</span>
                            <h2 style="margin: 0; font-size: 22px; color: #ffffff; font-weight: 700;">Köszönjük megtisztelő jelentkezését!</h2>
                            <p style="margin: 6px 0 0; color: #e2e8f0; font-size: 13px;">Demo-Trade Kft. &bull; Akkreditált Szakmai Szaktanácsadási Központ</p>
                          </div>

                          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px; color: #0f172a;">
                            Kedves <strong>${name}</strong>!
                          </p>

                          <p style="font-size: 15px; line-height: 1.7; color: #334155; margin-bottom: 20px;">
                            Köszönjük, hogy megtisztelt bennünket bizalmával és benyújtotta pályázatát a <strong>Demo-Trade Kft.</strong> által meghirdetett munkakörre. Ezúton igazoljuk vissza, hogy jelentkezési anyaga és szakmai önéletrajza sikeresen megérkezett hozzánk.
                          </p>

                          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #2d7d46; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
                            <h4 style="margin: 0 0 12px; color: #0f172a; font-size: 15px;">A rögzített jelentkezés adatai:</h4>
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                              <tr>
                                <td style="padding: 6px 0; color: #64748b; width: 170px;">Időpont:</td>
                                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${submissionTime}</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; color: #64748b;">Megpályázott pozíció:</td>
                                <td style="padding: 6px 0; font-weight: bold; color: #2d7d46;">${position || 'Általános jelentkezés'}</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; color: #64748b;">Megadott telefonszám:</td>
                                <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${phone || 'Nincs megadva'}</td>
                              </tr>
                              ${attachment && attachment.filename ? `
                              <tr>
                                <td style="padding: 6px 0; color: #64748b;">Csatolt önéletrajz:</td>
                                <td style="padding: 6px 0; font-weight: 600; color: #f27922;">📎 ${attachment.filename}</td>
                              </tr>
                              ` : ''}
                            </table>
                          </div>

                          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
                            <h4 style="margin: 0 0 8px; color: #166534; font-size: 15px;">Mi a kiválasztási folyamat következő lépése?</h4>
                            <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #15803d;">
                              Szakmai csapatunk és cégvezetésünk minden beérkező önéletrajzot gondosan és egyénileg áttekint. Amennyiben szakmai tapasztalata, képesítése és motivációja találkozik a pozíció elvárásaival, kollégánk a megadott elérhetőségein (telefonon vagy e-mailben) hamarosan felveszi Önnel a kapcsolatot a személyes találkozó egyeztetése érdekében.
                            </p>
                          </div>

                          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                            Kérdés esetén készséggel állunk rendelkezésére elérhetőségeinken:<br />
                            📞 <a href="tel:+36303462848" style="color: #2d7d46; font-weight: bold; text-decoration: none;">+36 30 346 2848</a> (Moravszki Gábor cégvezető)<br />
                            ✉️ <a href="mailto:demo.trade.mg@gmail.com" style="color: #2d7d46; font-weight: bold; text-decoration: none;">demo.trade.mg@gmail.com</a>
                          </p>

                          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />

                          <table style="width: 100%; font-size: 12px; color: #64748b;">
                            <tr>
                              <td>
                                <strong>Demo-Trade Kft.</strong><br />
                                Mezőgazdasági Szaktanácsadási Központ<br />
                                Nyíregyháza &bull; Kisvárda
                              </td>
                              <td style="text-align: right; vertical-align: bottom;">
                                Rendszerünk ezt a levelet automatikusan küldte.
                              </td>
                            </tr>
                          </table>
                        </div>
                      `
                    };
                    await transporter.sendMail(confirmationMailOptions);
                  } catch (confErr) {
                    console.warn('Applicant confirmation email error (non-fatal):', confErr);
                  }
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  message: type === 'career'
                    ? 'Köszönjük! Jelentkezését és önéletrajzát sikeresen elküldtük! Visszaigazoló e-mailt küldtünk a megadott címre.'
                    : 'Köszönjük! Üzenetét sikeresen továbbítottuk e-mailben.'
                }));
              } catch (err) {
                console.error('SMTP Email Error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Hiba történt a levél küldésekor: ' + err.message }));
              }
            });
          } else {
            res.statusCode = 405;
            res.end();
          }
        });

        // Supabase Pro Image Upload Middleware for local dev
        server.middlewares.use('/api/upload-image', async (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
              try {
                const { imageBase64, filename = 'image.jpg', folder = 'posts' } = JSON.parse(body);

                if (!imageBase64) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ success: false, message: 'Hiányzó képadat.' }));
                }

                const { createClient } = await import('@supabase/supabase-js');
                const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://netwmohjucdoomghiuzk.supabase.co';
                const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldHdtb2hqdWNkb29tZ2hpdXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk1ODMwNSwiZXhwIjoyMDk4NTM0MzA1fQ.MZs0tlNQovIvK127FqbQORe73A97BfZY68RH4LXKz9A';
                const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

                const matches = imageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
                let mimeType = 'image/jpeg';
                let base64Data = imageBase64;
                if (matches && matches.length === 3) {
                  mimeType = matches[1];
                  base64Data = matches[2];
                }

                const buffer = Buffer.from(base64Data, 'base64');
                const ext = mimeType.includes('png') ? 'png' : (mimeType.includes('webp') ? 'webp' : 'jpg');
                const cleanName = filename.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').substring(0, 40) || 'upload';
                const storagePath = `${folder}/${Date.now()}-${cleanName}.${ext}`;

                const { error: uploadErr } = await supabaseAdmin.storage
                  .from('webpage-images')
                  .upload(storagePath, buffer, {
                    contentType: mimeType,
                    upsert: true
                  });

                if (uploadErr) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ success: false, message: uploadErr.message }));
                }

                const { data: pubData } = supabaseAdmin.storage
                  .from('webpage-images')
                  .getPublicUrl(storagePath);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  publicUrl: pubData.publicUrl,
                  path: storagePath
                }));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: err.message }));
              }
            });
          } else {
            res.statusCode = 405;
            res.end();
          }
        });
      }
    }
  ]
});
