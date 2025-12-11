import { IsNotEmpty, IsString, MinLength } from "class-validator"

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "A senha deve ter pelo menos 6 caracteres" })
  newPassword: string

  @IsString()
  @IsNotEmpty()
  confirmPassword: string
}