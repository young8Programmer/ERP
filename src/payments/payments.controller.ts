import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesUserGuard } from 'src/auth/rolesUserGuard';

@Controller('payments')
@UseGuards(AuthGuard, RolesUserGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    const payment = await this.paymentsService.create(createPaymentDto);
    return { message: "To'lov muvaffaqiyatli qo'shildi", data: payment };
  }

  @Get()
  async findAll() {
    const payments = await this.paymentsService.findAll();
    return { message: "To'lovlar ro'yxati", data: payments };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const payment = await this.paymentsService.findOne(+id);
    if (!payment) {
      throw new NotFoundException("To'lov topilmadi");
    }
    return { message: "To'lov topildi", data: payment };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    const payment = await this.paymentsService.update(+id, updatePaymentDto);
    if (!payment) {
      throw new NotFoundException("To'lov topilmadi, yangilash bajarilmadi");
    }
    return { message: "To'lov muvaffaqiyatli yangilandi", data: payment };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const payment = await this.paymentsService.findOne(+id);
    if (!payment) {
      throw new NotFoundException("To'lov topilmadi, o'chirish bajarilmadi");
    }
    await this.paymentsService.remove(+id);
    return { message: "To'lov muvaffaqiyatli o'chirildi" };
  }
}
