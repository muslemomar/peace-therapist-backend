const moment = require('moment');

const {UnprocessableEntity, Forbidden, NotFound} = require('../utils/error');
const {
    APPOINTMENT_MIN_DURATION_IN_MINS,
    APPOINTMENT_MAX_DURATION_IN_MINS,
    FIRST_APPOINTMENT_DURATION_IN_MINS
} = require('../constants/appointments');

exports.validateAppointmentDates = (startDate, endDate) => {
    const momentStartDate = moment(startDate);
    const momentEndDate = endDate ? moment(endDate) : moment(startDate).add(FIRST_APPOINTMENT_DURATION_IN_MINS, 'minutes');
    const isEndDateAfterStartDate = momentEndDate.isAfter(momentStartDate);
    const appointmentDurationInMins = momentEndDate.diff(momentStartDate, 'minutes');

    if (!isEndDateAfterStartDate) throw new UnprocessableEntity('"endDate" should be after "startDate"');
    if (appointmentDurationInMins < APPOINTMENT_MIN_DURATION_IN_MINS) throw new UnprocessableEntity(`appointment duration is less than minimum duration. (${APPOINTMENT_MIN_DURATION_IN_MINS} mins)`);
    if (appointmentDurationInMins > APPOINTMENT_MAX_DURATION_IN_MINS) throw new UnprocessableEntity(`appointment duration is more than maximum duration. (${APPOINTMENT_MAX_DURATION_IN_MINS} mins)`);
};