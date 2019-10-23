import Mail from '../../lib/Mail';

class SupportMail {
  get key() {
    return 'SupportMail';
  }

  async handle({ data }) {
    const { supportOrder } = data;

    await Mail.sendMail({
      to: `${supportOrder.student.name} <${supportOrder.student.email}>`,
      subject: 'Nova mensagem de suporte',
      template: 'answer',
      context: {
        student: supportOrder.student.name,
        question: supportOrder.question,
        answer: supportOrder.answer,
      },
    });
  }
}

export default new SupportMail();
