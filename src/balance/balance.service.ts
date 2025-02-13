import { Injectable, NotFoundException, OnModuleInit  } from '@nestjs/common';

import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { SmartConfigService } from '@hsuite/smart-config'
import { BalanceResponse } from './interfaces/balance-response.interface';
import { clearScreenDown } from 'readline';
@Injectable()
export class BalanceService  {
  constructor(
    private readonly httpService: HttpService,
    private readonly smartConfigService: SmartConfigService
  ) {}

  private tinybarToHbar(tinybar: number): number {
    return tinybar / 100000000;
  }

  async getBalance(accountId: string, isHbar: boolean): Promise<BalanceResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        const url = `${this.smartConfigService.getMirrorNode().url}/api/v1/balances?account.id=${accountId}`;
        const response: AxiosResponse = await this.httpService.get(url).toPromise();
        
        const { timestamp, balances } = response.data;

        if (!balances || balances.length === 0) {
          throw new NotFoundException('Account not found');
        }

        // Convert balances to Hbar if isHbar is true
        const convertedBalances = balances.map((balance: { account: any; balance: number; }) => {
          return {
            account: balance.account,
            balance: isHbar ? this.tinybarToHbar(balance.balance) : balance.balance
          };
        });

        const result: BalanceResponse = { timestamp, balances: convertedBalances };

        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
}