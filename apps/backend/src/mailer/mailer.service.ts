import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as nodemailer from "nodemailer"
import { User } from "../auth/entities/user.entity"
import { ScheduledTweet } from "../scheduled-tweets/entities/scheduled-tweet.entity"

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name)
  private transporter: nodemailer.Transporter

  constructor(private configService: ConfigService) {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    const host = this.configService.get<string>("SMTP_HOST")
    const port = this.configService.get<number>("SMTP_PORT")
    const user = this.configService.get<string>("SMTP_USER")
    const password = this.configService.get<string>("SMTP_PASSWORD")
    const senderEmail = this.configService.get<string>("SENDER_EMAIL")

    if (!host || !port || !user || !password || !senderEmail) {
      this.logger.warn(
        "Email configuration incomplete. Email notifications will be disabled."
      )
      return
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // TLS for 587, SSL for 465
      auth: {
        user,
        pass: password
      }
    })

    this.logger.log(`Email transporter initialized for ${user}`)
  }

  /**
   * Enviar notificação quando um tweet é postado com sucesso
   */
  async sendTweetPostedNotification(
    user: User,
    tweet: ScheduledTweet
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn("Email transporter not configured. Skipping notification.")
      return
    }

    try {
      const senderEmail = this.configService.get<string>("SENDER_EMAIL")
      const tweetLink = `https://x.com/${user.twitterUsername}/status/${tweet.tweetId}`

      const htmlContent = this.generateTweetPostedTemplate(
        tweet,
        tweetLink,
        user.twitterUsername
      )

      const info = await this.transporter.sendMail({
        from: senderEmail,
        to: user.email,
        subject: "✅ Tweet postado com sucesso!",
        html: htmlContent,
        text: this.generatePlainTextTemplate(tweet, tweetLink)
      })

      this.logger.log(
        `Email notification sent to ${user.email} for tweet ID ${tweet.id}. Message ID: ${info.messageId}`
      )
    } catch (error) {
      this.logger.error(
        `Failed to send email notification for tweet ID ${tweet.id}:`,
        error.message
      )
      // Do not block the posting flow if the email fails
    }
  }

  /**
   * Enviar notificação quando um tweet falha ao ser postado
   */
  async sendTweetFailedNotification(
    user: User,
    tweet: ScheduledTweet
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn("Email transporter not configured. Skipping notification.")
      return
    }

    try {
      const senderEmail = this.configService.get<string>("SENDER_EMAIL")

      const htmlContent = this.generateTweetFailedTemplate(tweet)

      const info = await this.transporter.sendMail({
        from: senderEmail,
        to: user.email,
        subject: "❌ Erro ao postar tweet",
        html: htmlContent,
        text: this.generateFailedPlainTextTemplate(tweet)
      })

      this.logger.log(
        `Error notification email sent to ${user.email} for tweet ID ${tweet.id}. Message ID: ${info.messageId}`
      )
    } catch (error) {
      this.logger.error(
        `Failed to send error notification email for tweet ID ${tweet.id}:`,
        error.message
      )
    }
  }

  /**
   * Template HTML para sucesso
   */
  private generateTweetPostedTemplate(
    tweet: ScheduledTweet,
    tweetLink: string,
    twitterUsername: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
            .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #1DA1F2; }
            .header h1 { color: #1DA1F2; margin: 0; font-size: 24px; }
            .content { padding: 20px 0; }
            .tweet-box { background: white; border: 1px solid #e1e8ed; border-radius: 8px; padding: 16px; margin: 16px 0; }
            .tweet-header { font-weight: bold; color: #1DA1F2; margin-bottom: 8px; }
            .tweet-text { font-size: 15px; line-height: 1.4; margin: 12px 0; }
            .tweet-meta { color: #657786; font-size: 13px; margin-top: 12px; }
            .cta-button { display: inline-block; background: #1DA1F2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 24px; margin-top: 16px; font-weight: bold; }
            .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e1e8ed; color: #657786; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Tweet Postado com Sucesso!</h1>
            </div>
            <div class="content">
              <p>Olá,</p>
              <p>Seu tweet foi postado com sucesso no X (Twitter)!</p>
              <div class="tweet-box">
                <div class="tweet-header">@${twitterUsername}</div>
                <div class="tweet-text">${this.escapeHtml(tweet.text)}</div>
                <div class="tweet-meta">
                  Tweet ID: <code>${tweet.tweetId}</code>
                </div>
              </div>
              <p>
                <a href="${tweetLink}" class="cta-button">Ver Tweet no X</a>
              </p>
              <p>
                Data de postagem: <strong>${new Date(tweet.scheduledFor).toLocaleString("pt-BR")}</strong>
              </p>
            </div>
            <div class="footer">
              <p>© 2025 TweetScheduler CMS | Seu sistema de agendamento de tweets</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Template HTML para falha
   */
  private generateTweetFailedTemplate(tweet: ScheduledTweet): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
            .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #E74C3C; }
            .header h1 { color: #E74C3C; margin: 0; font-size: 24px; }
            .content { padding: 20px 0; }
            .tweet-box { background: white; border: 1px solid #e1e8ed; border-radius: 8px; padding: 16px; margin: 16px 0; }
            .tweet-text { font-size: 15px; line-height: 1.4; margin: 12px 0; }
            .error-box { background: #FEE; border: 1px solid #E74C3C; border-radius: 8px; padding: 12px; margin: 16px 0; color: #721c24; }
            .error-title { font-weight: bold; margin-bottom: 8px; }
            .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e1e8ed; color: #657786; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Erro ao Postar Tweet</h1>
            </div>
            <div class="content">
              <p>Olá,</p>
              <p>Houve um erro ao tentar postar seu tweet. Verifique os detalhes abaixo:</p>
              <div class="tweet-box">
                <div class="tweet-text">${this.escapeHtml(tweet.text)}</div>
              </div>
              <div class="error-box">
                <div class="error-title">Erro:</div>
                <p>${this.escapeHtml(tweet.errorMessage || "Erro desconhecido")}</p>
              </div>
              <p>
                Por favor, verifique seu tweet e tente novamente através do dashboard.
              </p>
              <p>
                Tweet ID: <code>${tweet.id}</code>
              </p>
            </div>
            <div class="footer">
              <p>© 2025 TweetScheduler CMS | Seu sistema de agendamento de tweets</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Template texto puro para sucesso
   */
  private generatePlainTextTemplate(
    tweet: ScheduledTweet,
    tweetLink: string
  ): string {
    return `
Tweet Postado com Sucesso!

Seu tweet foi publicado no X (Twitter).

---
${tweet.text}
---

Tweet ID: ${tweet.tweetId}
Data: ${new Date(tweet.scheduledFor).toLocaleString("pt-BR")}

Ver tweet: ${tweetLink}

© 2025 TweetScheduler CMS
    `.trim()
  }

  /**
   * Template texto puro para falha
   */
  private generateFailedPlainTextTemplate(tweet: ScheduledTweet): string {
    return `
Erro ao Postar Tweet

Houve um erro ao tentar postar seu tweet:

---
${tweet.text}
---

Erro: ${tweet.errorMessage || "Erro desconhecido"}

Tweet ID: ${tweet.id}

Por favor, verifique o tweet e tente novamente.

© 2025 TweetScheduler CMS
    `.trim()
  }

  /**
   * Escapar HTML para evitar XSS
   */
  private escapeHtml(text: string): string {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }
}
