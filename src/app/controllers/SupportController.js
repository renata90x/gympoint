import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import SupportMail from '../jobs/SupportMail';

import Queue from '../../lib/Queue';

class SupportController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const supportOrder = await HelpOrder.findAll({
      where: {
        answer: null,
      },
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (supportOrder.length === 0) {
      return res.status(200).json('All clear');
    }

    return res.json(supportOrder);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { id } = req.params;
    const { answer } = req.body;

    const supportOrder = await HelpOrder.findOne({
      where: { student_id: id },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    const answerAt = new Date();

    await supportOrder.update({
      answer,
      answer_at: answerAt,
    });

    /**
     * Notify student
     */
    await Queue.add(SupportMail.key, {
      supportOrder,
    });

    return res.json(supportOrder);
  }
}

export default new SupportController();
