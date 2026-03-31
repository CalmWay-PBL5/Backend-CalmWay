import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * DTO cho endpoint chat
 */
export class ChatDto {
  /**
   * Tin nhắn từ người dùng
   * @example "Làm sao tôi có thể ..?"
   */
  @IsString({ message: 'Message phải là string' })
  @IsNotEmpty({ message: 'Message không được để trống' })
  @MinLength(1, { message: 'Message phải có ít nhất 1 ký tự' })
  message!: string;
}
