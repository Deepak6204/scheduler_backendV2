import { addMultipleAvailabilities, getAvailabilitiesByUserId, updateAvailability, deleteAvailabilityModel } from './AvailabilityModel.js';
import pool from '../../config/DatabaseConfig.js';

export const addMultiple = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const dataArray = req.body.availabilities;
    dataArray.userId = req.user.userId;

    if (!Array.isArray(dataArray)) {
      connection.release();
      return res.status(400).json({
        status: 'error',
        message: 'availabilities must be an array',
      });
    }

    await addMultipleAvailabilities(dataArray, connection);
    connection.release();

    return res.status(201).json({
      status: 'success',
      message: 'Availabilities added successfully',
    });
  } catch (err) {
    connection.release();
    console.error('Error adding availabilities:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
}

export const getByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const availabilities = await getAvailabilitiesByUserId(userId);
    return res.status(200).json({
      status: 'success',
      data: availabilities,
    });
  } catch (err) {
    console.error('Error fetching availabilities:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
}

export const update = async (req, res) => {
  const { availabilityId } = req.params;
  const updatedData = req.body;

  try {
    await updateAvailability(availabilityId, updatedData);

    return res.status(200).json({
      status: 'success',
      message: 'Availability updated successfully',
    });
  } catch (err) {
    console.error('Error updating availability:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
}

export const deleteAvailability = async (req, res) => {
  const { availabilityId } = req.params;
  const { softDelete = 'true' } = req.query;

  try {
    await deleteAvailabilityModel(availabilityId, softDelete === 'true');

    return res.status(200).json({
      status: 'success',
      message: 'Availability deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting availability:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
}
