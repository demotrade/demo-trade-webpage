import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const {
    name,
    email,
    phone,
    subject,
    message,
    position,
    productName,
    type = 'contact',
    attachment,
    honeypot,
    privacyConsent
  } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Kérjük töltse ki a kötelező mezőket!' });
  }

  // Spam Bot Honeypot Trap check
  if (honeypot) {
    console.warn('Bot submission blocked via Honeypot trap.');
    return res.status(200).json({ success: true, message: 'Köszönjük! Jelentkezését/üzenetét sikeresen továbbítottuk.' });
  }

  // GDPR Privacy consent check
  if (privacyConsent === false) {
    return res.status(400).json({ success: false, message: 'Kérjük fogadja el az Adatkezelési tájékoztatót!' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'demotradekft@gmail.com',
        pass: process.env.SMTP_PASS || 'cjjxniblpeyetuvm'
      }
    });

    const recipient = process.env.RECIPIENT_EMAIL || 'gava.tibor74@gmail.com';

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

    return res.status(200).json({
      success: true,
      message: type === 'career'
        ? 'Köszönjük! Jelentkezését és önéletrajzát sikeresen elküldtük! Visszaigazoló e-mailt küldtünk a megadott címre.'
        : 'Köszönjük! Üzenetét sikeresen továbbítottuk e-mailben.'
    });
  } catch (err) {
    console.error('SMTP Email Error:', err);
    return res.status(500).json({ success: false, message: 'Hiba történt a levél küldésekor: ' + err.message });
  }
}
