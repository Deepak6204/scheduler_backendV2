import AvModel from './AvailabilityModel.js';
import pool from '../../config/DatabaseConfig.js';
import UuidGen from '../../services/UuidGen.js';

class AvailabilityController {
  static async addMultiple(req, res) {
    const connection = await pool.getConnection();

    try {
      const dataArray = req.body.availabilities;

      if (!Array.isArray(dataArray)) {
        connection.release();
        return res.status(400).json({
          status: 'error',
          message: 'availabilities must be an array',
        });
      }

      await AvModel.addMultipleAvailabilities(dataArray, connection);
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

  static async getByUserId(req, res) {
    const { userId } = req.params;

    try {
      const availabilities = await AvModel.getAvailabilitiesByUserId(userId);
      
      const formattedAvailabilities = availabilities.map((availability) => ({
        ...availability,
        availabilityId: UuidGen.binaryToUuid(availability.availabilityId),
        userId: UuidGen.binaryToUuid(availability.userId),
      }));

      return res.status(200).json({
        status: 'success',
        data: formattedAvailabilities,
      });
    } catch (err) {
      console.error('Error fetching availabilities:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  static async update(req, res) {
    const { availabilityId } = req.params;
    const updatedData = req.body;

    try {
      await AvModel.updateAvailability(availabilityId, updatedData);

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

  static async delete(req, res) {
    const { availabilityId } = req.params;
    const { softDelete = 'true' } = req.query;

    try {
      await AvModel.deleteAvailability(availabilityId, softDelete === 'true');

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
}

export default AvailabilityController;
