import { Op } from 'sequelize';
import { subDays } from 'date-fns';
import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const { id } = req.params;
    const checkin = await Checkin.findAll({
      where: { student_id: id },
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

    return res.json(checkin);
  }

  async store(req, res) {
    const { id } = req.params;

    const checkValidCheckin = await Checkin.findAll({
      where: { student_id: id },
      created_at: {
        [Op.between]: [subDays(new Date(), 7), new Date()],
      },
    });

    if (checkValidCheckin.length >= 5) {
      return res
        .status(401)
        .json({ error: 'You can only do 5 checkins per week' });
    }

    const checkin = await Checkin.create({
      student_id: id,
    });

    return res.json(checkin);
  }
}

export default new CheckinController();
