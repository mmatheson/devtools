export async function waitUntilMessage(page: any, message: string, timeout = 30_000): Promise<any> {
  return await new Promise((resolve, reject) => {
    setTimeout(reject, timeout);
    page.on("console", async (msg: any) => {
      try {
        const firstArg = await msg.args()[0]?.jsonValue();
        if (firstArg === message) {
          const secondArg = await msg.args()[1]?.jsonValue();
          resolve(secondArg);
        }
      } catch (e) {
        console.log("Unserializable value");
      }
    });
  });
}
