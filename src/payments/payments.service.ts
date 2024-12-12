import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create(createPaymentDto);
    return this.paymentRepository.save(payment);
  }

  findAll(): Promise<Payment[]> {
    return this.paymentRepository.find();
  }

  findOne(id: number): Promise<Payment> {
    return this.paymentRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    await this.paymentRepository.update(id, updatePaymentDto);
    return this.paymentRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.paymentRepository.delete(id);
  }
}
