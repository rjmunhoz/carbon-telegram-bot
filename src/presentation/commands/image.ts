import carbon from '../../util/carbon'
import entity from '../../util/entity'
import { ContextMessageUpdate } from 'telegraf'
import { getKeyboard } from '../../util/keyboard'

export function factory () {
  return async function handler (ctx: ContextMessageUpdate) {
    if (!ctx.message) return
    if (!ctx.chat) return

    const message = ctx.message.reply_to_message || ctx.message

    const { chat: { id: chatId } } = ctx
    const messageId = message.message_id

    const sentMessage = await ctx.reply('Processing...', { reply_to_message_id: ctx.message.message_id })

    const url = entity.toUrl(message)

    if (!url) return

    const imageBuffer = await carbon.getScreenshotFromUrl({ url })

    const extra = getKeyboard(url).asExtra().inReplyTo(ctx.message.message_id)

    const { message_id: imageMessageId } = await ctx.telegram.sendPhoto(chatId, { source: imageBuffer }, extra as any)
    await ctx.telegram.deleteMessage(chatId, sentMessage.message_id)

    const secondKeyboard = getKeyboard(url, { from: messageId, to: imageMessageId }).asString()

    await ctx.telegram.editMessageReplyMarkup(chatId, imageMessageId, undefined, secondKeyboard)
  }
}

export default { factory }
