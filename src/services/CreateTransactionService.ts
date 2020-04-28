import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepositiry = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }

    let categTransaction = await categoryRepositiry.findOne({
      where: {
        title: category,
      },
    });

    if (!categTransaction) {
      categTransaction = categoryRepositiry.create({ title: category });

      await categoryRepositiry.save(categTransaction);
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category: categTransaction,
    });

    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
