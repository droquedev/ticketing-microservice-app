import express, { Request, Response } from "express"
import { body } from "express-validator"
import { User } from "../models"
import { Password } from "../services"
import jwt from "jsonwebtoken"
import { BadRequestError, validateRequest } from "@drtitik/common"

const router = express.Router()

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("You must supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body
    const existingUser = await User.findOne({ email })

    if (!existingUser) {
      throw new BadRequestError("Invalid credentials")
    }

    const passwordsMatch = await Password.compare(password, existingUser.password)

    if (!passwordsMatch) {
      throw new BadRequestError("Invalid credentials")
    }

    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    )

    req.session = {
      jwt: userJwt,
    }

    res.status(200).send(existingUser)
  }
)

export { router as signInRouter }
