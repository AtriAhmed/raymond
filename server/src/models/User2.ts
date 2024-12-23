import { DataTypes } from "sequelize";
const AccessLevel = require("./AccessLevel.ts");
const sequelize = require("../config/database.ts");

const User = sequelize.define(
  "User",
  {
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accessId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: AccessLevel,
        key: "permissionLevel",
      },
    },
    resetToken: {
      type: DataTypes.TEXT,
    },
    resetTokenExpires: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

User.belongsTo(AccessLevel, { foreignKey: "accessId" });

// User.sync({alter:true});

module.exports = User;
