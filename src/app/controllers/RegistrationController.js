import * as Yup from 'yup';
import { startOfDay, parseISO, isBefore, addMonths } from 'date-fns';
import Registration from '../models/Registration';

import Student from '../models/Student';
import Plan from '../models/Plan';

import RegistrationMail from '../jobs/RegistrationMail';
import Queue from '../../lib/Queue';

class RegistrationController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const registration = await Registration.findAll({
      order: ['start_date'],
      attributes: [
        'id',
        'student_id',
        'plan_id',
        'start_date',
        'end_date',
        'price',
      ],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title'],
        },
      ],
    });

    return res.json(registration);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const checkRegistration = await Registration.findOne({
      where: { student_id },
    });

    if (checkRegistration) {
      return res.json('Student already has a plan');
    }

    const dateStart = startOfDay(parseISO(start_date));

    if (isBefore(dateStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const plan = await Plan.findByPk(plan_id);

    const endOfPlan = addMonths(parseISO(start_date), plan.duration);
    const finalPrice = plan.price * plan.duration;

    const registration = await Registration.create({
      student_id,
      plan_id,
      start_date: dateStart,
      end_date: endOfPlan,
      price: finalPrice,
    });

    /**
     * Notify registration student
     */
    const registrationComplete = await Registration.findByPk(registration.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title'],
        },
      ],
    });

    await Queue.add(RegistrationMail.key, {
      registrationComplete,
    });

    return res.json(registration);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }

    const { id } = req.params;
    const { student_id, plan_id, start_date } = req.body;

    const registration = await Registration.findByPk(id);
    const plan = await Plan.findByPk(plan_id);

    if (!registration) {
      return res.status(400).json('This registration does not exist');
    }

    const dateStart = startOfDay(parseISO(start_date));

    if (isBefore(dateStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const endOfPlan = addMonths(parseISO(start_date), plan.duration);
    const finalPrice = plan.price * plan.duration;

    const setRegistration = await registration.update({
      id,
      student_id,
      plan_id,
      start_date: dateStart,
      end_date: endOfPlan,
      price: finalPrice,
    });

    return res.json(setRegistration);
  }

  async delete(req, res) {
    const { id } = req.params;

    await Registration.destroy({ where: { id } });

    return res.send();
  }
}

export default new RegistrationController();
