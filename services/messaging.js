const amqp = require("amqplib");

let channel = null;
const queueName = "alertas";

async function connectRabbitMQ(retries = 10, delay = 5000) {
  const amqpUrl = process.env.RABBITMQ_URL || "amqp://localhost";
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await amqp.connect(amqpUrl);
      channel = await connection.createChannel();
      await channel.assertQueue(queueName);
      console.log(`✅ Conectado ao RabbitMQ em ${amqpUrl}`);
      return;
    } catch (error) {
      console.error(
        `⚠️ Falha ao conectar (${i + 1}/${retries}): ${error.message}`
      );
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  console.error(
    "❌ Não foi possível conectar ao RabbitMQ após várias tentativas."
  );
}

async function sendMessage(message) {
  if (!channel) {
    console.error("⚠️ Canal RabbitMQ não está disponível.");
    return;
  }
  try {
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
    console.log("📨 Mensagem enviada para fila:", message);
  } catch (error) {
    console.error("Erro ao enviar mensagem para RabbitMQ:", error);
  }
}

module.exports = { connectRabbitMQ, sendMessage };
