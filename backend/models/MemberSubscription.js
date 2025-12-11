// backend/models/MemberSubscription.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MemberSubscription = sequelize.define('MemberSubscription', {
  sub_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  m_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'member',
      key: 'm_id'
    }
  },
  plan_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    references: {
      model: 'membership',
      key: 'plan_code'
    }
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'member_subscriptions',
  timestamps: false
});

module.exports = MemberSubscription;