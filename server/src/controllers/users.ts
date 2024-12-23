import { NextFunction, Request, Response } from 'express';
import { accessIdSupOrEqualTo } from '../middlewares/accessIdSupOrEqTo';

const User = require("../models/User");
const AccessLevel = require("../models/AccessLevel");
const bcrypt = require('bcrypt')
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const saltRounds = 10;

const { check, body, validationResult } = require('express-validator');
const { Op } = require('sequelize');

function removeSpaces(req: any, res:Response, next: NextFunction) {
  if (req.files?.image) {
    req.files.image.name = req.files.image.name.replace(/\s/g, '');
  }
  next();
} 

export default {
  createNewUser:[
  removeSpaces,
  accessIdSupOrEqualTo(3),
  body('firstname')
      .notEmpty().withMessage('Le champ Prénom est requis.')
      .isLength({ max: 50 }).withMessage('Le Prénom doit comporter au maximum 50 caractères.'),
  body('lastname')
      .notEmpty().withMessage('Le champ Nom est requis.')
      .isLength({ max: 50 }).withMessage('Le Nom doit comporter au maximum 50 caractères.'),
  body('email')
      .notEmpty().withMessage('Le champ Email est requis.')
      .isEmail().withMessage('Le format de l\'email est incorrect.')
      .isLength({ max: 50 }).withMessage('L\'email doit comporter au maximum 50 caractères.'),
  body('password')
      .notEmpty().withMessage('Le champ Mot de passe est requis.')
      .isLength({ min:4, max: 50 }).withMessage('Le Mot de passe doit comporter entre 4 et 50 caractères.'),
  body('accessId')
      .notEmpty().withMessage('Le champ Niveau d\'accès est requis.')
      .isNumeric().withMessage('Le Niveau d\'accès doit être un nombre.')
      .isLength({ min:1, max:1 }).withMessage('Le Niveau d\'accès doit comporter 1 seul caractères.'),
  body('position')
      .notEmpty().withMessage('Le champ Poste est requis.')
      .isLength({ max: 192 }).withMessage('Le Poste doit comporter au maximum 192 caractères.'),
  body('startDate')
      .notEmpty().withMessage('Le champ Date de début est requis.')
      .isDate().withMessage('Le format de la date est incorrect.'),
  body('contractType')
      .notEmpty().withMessage('Le champ Type de contrat est requis.')
      .isLength({ max: 192 }).withMessage('Le Type de contrat doit comporter au maximum 192 caractères.'),
  body('salary')
      .notEmpty().withMessage('Le champ Salaire est requis.')
      .isNumeric().withMessage('Le Salaire doit être un nombre.')
      .isLength({ max: 50 }).withMessage('Le Salaire doit comporter au maximum 50 caractères.'),
  body('phone')
      .notEmpty().withMessage('Le champ Téléphone est requis.')
      .isLength({min:8,max:8}).withMessage('Le Téléphone doit comporter 8 caractères.'),
      async (req: any, res:Response) => {
        const errors = validationResult(req);
        const errorMessages = errors.array().reduce((accumulator:any, error:any) => {
            accumulator[error.path] = error.msg;
            return accumulator;
        }, {});
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errorMessages });
        }
        const body = req.body;
    try {
      const hash = await bcrypt.hash(body.password, saltRounds);
      
      let picture;
      if (req.files?.image) {
        var file = req.files.image
        picture = `uploads/images/${file.name}`
        await file.mv(`./public/uploads/images/${file.name}`);
      } else {
        picture = '';
      }
      
      const user = {
        ...body,
        password: hash,
        picture
      };

      const result = await User.create(user);
      res.status(200).json({ id: result.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  }],
  updateUserById:[  removeSpaces,
    accessIdSupOrEqualTo(3),
    body('firstname')
      .notEmpty().withMessage('Le champ Prénom est requis.')
      .isLength({ max: 50 }).withMessage('Le Prénom doit comporter au maximum 50 caractères.'),
  body('lastname')
      .notEmpty().withMessage('Le champ Nom est requis.')
      .isLength({ max: 50 }).withMessage('Le Nom doit comporter au maximum 50 caractères.'),
  body('email')
      .notEmpty().withMessage('Le champ Email est requis.')
      .isEmail().withMessage('Le format de l\'email est incorrect.')
      .isLength({ max: 50 }).withMessage('L\'email doit comporter au maximum 50 caractères.'),
  body('accessId')
      .notEmpty().withMessage('Le champ Niveau d\'accès est requis.')
      .isNumeric().withMessage('Le Niveau d\'accès doit être un nombre.')
      .isLength({ min:1, max:1 }).withMessage('Le Niveau d\'accès doit comporter 1 seul caractères.'),
  body('position')
      .notEmpty().withMessage('Le champ Poste est requis.')
      .isLength({ max: 192 }).withMessage('Le Poste doit comporter au maximum 192 caractères.'),
  body('startDate')
      .notEmpty().withMessage('Le champ Date de début est requis.')
      .isDate().withMessage('Le format de la date est incorrect.'),
  body('contractType')
      .notEmpty().withMessage('Le champ Type de contrat est requis.')
      .isLength({ max: 192 }).withMessage('Le Type de contrat doit comporter au maximum 192 caractères.'),
  body('salary')
      .notEmpty().withMessage('Le champ Salaire est requis.')
      .isNumeric().withMessage('Le Salaire doit être un nombre.')
      .isLength({ max: 50 }).withMessage('Le Salaire doit comporter au maximum 50 caractères.'),
  body('phone')
      .notEmpty().withMessage('Le champ Téléphone est requis.')
      .isLength({min:8,max:8}).withMessage('Le Téléphone doit comporter 8 caractères.'),
    async (req: any, res:Response) => {

          const errors = validationResult(req);
          const errorMessages = errors.array().reduce((accumulator:any, error:any) => {
              accumulator[error.param] = error.msg;
              return accumulator;
          }, {});
          if (!errors.isEmpty()) {
              return res.status(400).json({ errors: errorMessages });
          }

          let oldUser:any = {};
          User.findByPk(req.params.id).then((olduser:any)=>{
            oldUser = olduser;
          }).catch((err:any)=>{
            res.status(404).end()
          })
          
          const body = req.body;
          
          let picture;
          if (req.files?.image) {
            var file = req.files.image
            picture = `uploads/images/${file.name}`
            await file.mv(`./public/uploads/images/${file.name}`);
          } else {
            picture = '';
          }

        const userData:any = {
          ...body,
          picture: picture ? picture : oldUser.picture,
        };

        
        if (body.password) {
        const hash = await bcrypt.hash(body.password, saltRounds);
        userData.password = hash;
    }
   
      try {
        const result = await User.update(userData, {
          where: { _id: req.params.id },
        });
        if (result[0] === 0) {
          res.status(204).end();
        } else {
          res.status(200).end();
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error });
      }
    
  }],
  getAllUsers: [accessIdSupOrEqualTo(3), async (req: Request, res: Response) => {
    
    try {
      const { keyword } = req.query;

      const where:any = {};

      if (keyword) {
        where[Op.or] = [
          {
            firstname: {
              [Op.like]: `%${keyword}%`,
            },
          },
          {
            lastname: {
              [Op.like]: `%${keyword}%`,
            },
          },
        ];
      }
      

      const { page = 1, pageSize = 10 } = req.query;
const offset = (Number(page)-1) * Number(pageSize);

      const data = await User.findAndCountAll({
        attributes: {
          exclude: ['password'],
        },
        include: [
          {
            model: AccessLevel,
            attributes: ['type'],
          },
        ],
        order: [['_id', 'ASC']],
        limit: Number(pageSize),
        offset:Number(offset),
        where
      });
  
      const totalPages = Math.ceil(data.count / Number(pageSize));
  
      res.status(200).json({
        data: data.rows,
        pagination: {
          currentPage: +page,
          pageSize: +pageSize,
          totalPages,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  }],
  
  getUserById: [accessIdSupOrEqualTo(3),async (req: Request, res:Response) => {
    try {
      const data = await User.findByPk(req.params.id, {
        include: [
          {
            model: AccessLevel,
            attributes: ['type'],
          },
        ],
      });
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  }],
  deleteUserById: [accessIdSupOrEqualTo(3),async (req: Request, res:Response) => {
    try {
      const data = await User.destroy({
        where: { _id: req.params.id },
      });
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  }],
  updateProfile:[  removeSpaces,
    accessIdSupOrEqualTo(1),
    body('firstname')
        .notEmpty().withMessage('Le champ Prénom est requis.')
        .isLength({ max: 50 }).withMessage('Le Prénom doit comporter au maximum 50 caractères.'), async (req: any, res:Response) => {

          const errors = validationResult(req);
          const errorMessages = errors.array().reduce((accumulator:any, error:any) => {
              accumulator[error.param] = error.msg;
              return accumulator;
          }, {});
          if (!errors.isEmpty()) {
              return res.status(400).json({ errors: errorMessages });
          }

          let oldUser:any = {};
          User.findByPk(req.params.id).then((olduser:any)=>{
            oldUser = olduser;
          }).catch((err:any)=>{
            res.status(404).end()
          })
          
          const body = req.body;
          
          let picture;
          if (req.files?.image) {
            var file = req.files.image
            picture = `uploads/images/${file.name}`
            await file.mv(`./public/uploads/images/${file.name}`);
          } else {
            picture = '';
          }

        const userData:any = {
          firstname: body.firstname,
          lastname: body.lastname,
          email: body.email,
          phone: body.phone,
          picture: picture ? picture : oldUser.picture,
        };

        
        if (body.password) {
        const hash = await bcrypt.hash(body.password, saltRounds);
        userData.password = hash;
    }
   
      try {
        const result = await User.update(userData, {
          where: { _id: req.params.id },
        });
        if (result[0] === 0) {
          res.status(204).end();
        } else {
          res.status(200).end();
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error });
      }
    
  }],
  getUserByUsernameWithPassword: async (username: string, done: any) => {
    try {
      const user = await User.findOne({
        where: {
          email: username,
        },
        include: [AccessLevel],
      });
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err);
    }
  },
  sendResetEmail: async (req:any, res:Response) =>{
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ where: { email } });
  
      if (!user) {
        return res.status(400).send("user not found");
      }
  
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetTokenExpires = Date.now() + 3600000 * 2; // 1 hour from now
  
      await User.update(
        {
          resetToken,
          resetTokenExpires,
        },
        { where: { email } }
      );
  
      const transporter = nodemailer.createTransport({
        host: "ahmedatri.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL, // generated ethereal user
          pass: process.env.PASSWORD, // generated ethereal password
        },
      });
  
      const mailOptions = {
        from: "IBS <noreply@ahmedatri.com>",
        to: email,
        subject: "Réinitialisation de mot de passe IBS",
        html: emailBody(`${user.lastname} ${user.firstname}`, `${process.env.FRONTEND_URL}/reset-password/${resetToken}`, "1 heure"),
      };
  
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(info);
        res.status(200).send("sent");
      } catch (err) {
        console.log(err);
        res.status(400).send(JSON.stringify(err));
      }
    } catch (error) {
      console.error(error);
      res.status(400).send(JSON.stringify(error));
    }
  },
  resetPassword : async (req:any, res:Response) =>{
   const { token, password } = req.body;
  
   try {
     const user = await User.findOne({
       where: {
         resetToken: token,
         resetTokenExpires: { [Op.gt]: Date.now() },
       },
     });
  
     if (!user) {
       res.status(400).json("invalid or expired token");
       return;
     }
  
     const hash = await bcrypt.hash(password, saltRounds);
  
     user.password = hash;
     user.resetToken = null;
     user.resetTokenExpires = null;
  
     await user.save();
  
     req.logout();
  
     res.status(200).send("success");
   } catch (error) {
     console.error(error);
     res.status(400).send(JSON.stringify(error));
   }
  }
};

function emailBody(name:string, link:string, expiration:string) {
  return `
  <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Réinitialisation de votre mot de passe ELCAMBA</title>
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 16px;
        line-height: 1.5;
        color: #333;
        padding: 20px;
      }
      h1{
        font-size:32px;
        font-weight:bold;
        color:#dc2626;
        text-align:center;
        border-bottom:1px solid #e2e8f0;
        padding-bottom:10px;
        margin:0;
        margin-bottom:20px;
        
      }
      h2 {
        font-size: 20px;
        font-weight: bold;
        margin-top: 40px;
        margin-bottom: 20px;
      }
      p {
        margin-top: 0;
        margin-bottom: 20px;
      }
      p:first-of-type{
        text-transform: capitalize;
      }
      a {
        display:block;
        width:fit-content;
        color: #ffe357 !important;
        font-weight: bold;
        background-color: #0364ad;
        text-decoration: none;
        padding: 10px 20px;
        border-radius: 5px;
        transition: background-color 150ms;
      }
      a:hover {
        background-color: #0b3671;
      }
      .ps {
        font-size: 12px;
        margin-top: 20px;
      }
      .container{
        max-width:600px;
        margin:auto;
        border:1px solid #e2e8f0;
        border-radius:5px;
        padding:50px 30px;
      }

      .logo-container{
        display: flex;
        justify-content: center;
      }

      .logo{
        height: 100px;
      }
    </style>
  </head>
  <body>
    <section class="container">
        <div class="logo-container">
            <img src="https://scontent.ftun1-2.fna.fbcdn.net/v/t39.30808-6/305229524_553291583190534_2651116079606367955_n.png?_nc_cat=108&ccb=1-7&_nc_sid=efb6e6&_nc_ohc=YJB5jKbhjPkAX_uZnPi&_nc_ht=scontent.ftun1-2.fna&oh=00_AfCSBh7FsBO_ZuNT25BBf0Rmu96KSFlJ1cz4K71UgrjSaQ&oe=65C25B83" alt="ELCAMBA logo name" class="logo">
        </div>
        <h2>Réinitialisation de mot de passe</h2>
        <p>Bonjour ${name},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe sur IBS. Pour accéder à votre compte, veuillez cliquer sur le lien ci-dessous:</p>
        <p><a href="${link}">Réinitialiser votre mot de passe</a></p>
        <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
        <p>Cordialement,<br />L'équipe de IBS</p>
        <p class="ps">PS: Ce lien expirera dans ${expiration}. Veuillez le réinitialiser à nouveau si nécessaire.</p>
    </section>
  </body>
</html>
`;
}