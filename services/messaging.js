const amqp = require("amqplib");

let channel = null;
const queueName = "alertas";

async function connectRabbitMQ() {
  try {
    const amqpUrl = process.env.RABBITMQ_URL || "amqp://localhost";
    const connection = await amqp.connect(amqpUrl);
    channel = await connection.createChannel();
    await channel.assertQueue(queueName);
    console.log(`✅ Conectado ao RabbitMQ em ${amqpUrl}`);
  } catch (error) {
    console.error("❌ Erro ao conectar ao RabbitMQ:", error);
  }
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
