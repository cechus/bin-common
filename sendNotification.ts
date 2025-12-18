import { type Item } from "./getData";

const sendNotification = async (lastData: Item, users: Array<any>) => {
  try {
    if (!lastData) {
      return;
    }
    for (const item of users) {
      const notificationId = item.notificationId;
      const chatId = item.chatId;
      const price = item.price;
      const message = `💸<strong>${lastData.price} BOB</strong>
👤<a href="https://p2p.binance.com/en/advertiserDetail?advertiserNo=${
        lastData.advertiser.userNo
      }">${lastData.advertiser.nickName}</>
${lastData.advertiser.monthOrderCount} orders | ${Number(
        100 * lastData.advertiser.monthFinishRate
      ).toFixed(2)}% completion
Available: ${lastData.advertiser.tradableQuantity} USDT

<i>Order Limit:</i>
<strong>Bs. ${lastData.advertiser.minSingleTransAmount} - Bs. ${
        lastData.advertiser.maxSingleTransAmount
      }</strong>
<blockquote>Notification when price is over of: ${price}</blockquote>
          `;
      try {
        await fetch(
          // @ts-ignore
          `https://api.telegram.org/bot${Deno.env.get(
            "TELEGRAM_API_BOT"
          )}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: "HTML",
              disable_web_page_preview: true,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: `⛔ Delete Notification for price: ${price}`,
                      callback_data: `deleteOneNotification_${notificationId}`,
                    },
                  ],
                ],
              },
            }),
          }
        );
      } catch (e) {
        console.error("Error sending telegram message");
        console.error(e);
      }
    }
  } catch (e) {
    console.error("Error sending notification");
    console.error(e);
  }
};

export { sendNotification };
