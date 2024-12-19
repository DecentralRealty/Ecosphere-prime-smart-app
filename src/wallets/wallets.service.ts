import { 
    Injectable, 
    Logger, 
    OnModuleInit 
} from '@nestjs/common'
import { 
    Wallet, 
    WalletDocument 
} from './entities/wallet.entity'
import { IVC, I_IVC } from './interfaces/ivc.namespace'
import {
    AccountBalanceQuery,
    AccountId,
    LedgerId, 
    PrivateKey, 
    Status,
    Transaction
} from '@hashgraph/sdk'
import * as moment from 'moment'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'

import { 
    IHedera, 
    ISmartNode 
} from '@hsuite/types'
import { 
    WalletTransaction, 
    WalletTransactionDocument 
} from './entities/transaction.entity'
import { ClientService } from '@hsuite/client'
import { HederaClientHelper } from '@hsuite/helpers'
import { SmartConfigService } from '@hsuite/smart-config'
import Decimal from 'decimal.js'
import { IpfsResolverService } from '@hsuite/ipfs-resolver'
import { IDIssuer, IDIssuerDocument } from 'src/issuers/entities/issuer.entity'
import { IDCredential, IDCredentialDocument } from 'src/identities/credentials/entities/credential.entity'
import { CypherService } from 'src/cypher/cypher.service'
import { ConfigService } from '@nestjs/config'
import * as lodash from 'lodash'

@Injectable()
export class WalletsService implements OnModuleInit {
    protected logger: Logger = new Logger(WalletsService.name);
    private hederaClient: HederaClientHelper;
    private maxAutomaticTokenAssociations: number;

    constructor(
        private readonly smartConfigService: SmartConfigService,
        private readonly nodeClientService: ClientService,
        private readonly ipfsResolver: IpfsResolverService,
        private readonly cypherService: CypherService,
        private configService: ConfigService,
        @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
        @InjectModel(WalletTransaction.name) private walletTransactiontModel: Model<WalletTransactionDocument>,
        @InjectModel(IDIssuer.name) private issuerModel: Model<IDIssuerDocument>,
        @InjectModel(IDCredential.name) private credentialModel: Model<IDCredentialDocument>
    ) {
        this.maxAutomaticTokenAssociations = Number(this.configService.get<string>('maxAutomaticTokenAssociations'));
        this.hederaClient = new HederaClientHelper(
            LedgerId.fromString(this.smartConfigService.getEnvironment()),
            this.smartConfigService.getOperator(),
            this.smartConfigService.getMirrorNode()
          );
    }

    async onModuleInit() {}

    async getWallet(
        userId: string
    ): Promise<IVC.Wallet.History> {
        return new Promise(async(resolve, reject) => {
            try {
                // checking if the wallet exists for the given userId...
                let wallet: WalletDocument = await this.walletModel.findOne({
                    owner: userId
                });
        
                // if the wallet does not exist, then throw an error...
                if (!wallet) {
                    throw(new Error(`wallet not found for user ${userId}`));
                }

                // populating the transactions for the wallet...
                await wallet.populate({path: 'transactions'});

                // SMART-NODE CALL: fetching the onchain balance for the wallet...
                wallet.account.balance = (await this.nodeClientService.axios.get(
                    `/accounts/restful/${wallet.account.id}/tokens`)).data;                  

                const nfts = (await this.nodeClientService.axios.get(
                    `/accounts/restful/${wallet.account.id}/nfts`)).data.nfts;

                // let issuers = await this.issuerModel.find({
                //     nftID: {$in: wallet.account.balance.tokens.map((token: any) => token.token_id)}
                // });

                // let credentials: Array<IDCredentialDocument> = await this.credentialModel.find({
                //     owner: userId,
                //     issuer: {$in: issuers.map(issuer => issuer.issuer)}
                // });
                    
                // let metadataPromises = nfts.map(nft => this.ipfsResolver.getMetadata(nft.metadata));
                // let metadataResponses = await Promise.all(metadataPromises);

                // for(let index = 0; index < metadataResponses.length; index++) {
                //     const metadata = metadataResponses[index];
                //     let credential = credentials.find(credential => credential.serial_number == nfts[index].serial_number);
                //     nfts[index].metadata = metadata;
                    
                //     if(!lodash.isUndefined(credential?.iv)) {
                //         nfts[index].metadata.properties = JSON.parse(await this.cypherService.decrypt(
                //             nfts[index].metadata.properties.encryptedText,
                //             credential.iv
                //         ))
                //     }
                // }

                // wallet.account.balance.tokens.forEach((token: any) => {
                //     let nftsForToken = nfts.filter((nft: any) => nft.token_id == token.token_id);
                //     let issuer = issuers.find(issuer => issuer.nftID == token.token_id).issuer;
                    
                //     nftsForToken = nftsForToken.map(nft => {
                //         nft.credential = credentials.find(credential => 
                //             credential.issuer == issuer && credential.serial_number == nft.serial_number)

                //         return nft;
                //     });

                //     token['nfts'] = nftsForToken;
                // });

                resolve({
                    ...wallet.account,
                    transactions: wallet.transactions.filter(transaction => 
                        transaction.from == wallet.account.id || 
                        transaction.to == wallet.account.id
                    )
                });   
            } catch(error) {
                reject(error);
            }
        });
    }

    async createWallet(createWalletRequest: IVC.Wallet.Request.Create): Promise<Wallet> {
        return new Promise(async(resolve, reject) => {
            try {
                // checking if the wallet exists for the given userId...
                let walletDocument: WalletDocument = await this.walletModel.findOne({
                    owner: createWalletRequest.userId
                });
    
                // if the wallet already exists, then throw an error...
                if(walletDocument) {
                    throw(new Error(`wallet already exists for user ${createWalletRequest.userId}`));
                }

                  // 1. Generate the Hedera account for the device
                const privateKey = PrivateKey.generate();
                
                let payload = {
                    key: privateKey.publicKey.toString(),
                    balance: 0,
                    maxAutomaticTokenAssociations: <number> this.maxAutomaticTokenAssociations,
                    isReceiverSignatureRequired: false
                };
                console.log("wallet_payload", privateKey.toString(), privateKey.publicKey.toString())
           
                let response = await this.nodeClientService.axios.post(`/accounts?issinglesig=true`, payload);
                let transaction = Transaction.fromBytes(new Uint8Array(Buffer.from(response.data)));

                // signing the transaction and submitting it to the network...
                const client = this.hederaClient.getClient();
                const signTx = await transaction.sign(privateKey
                );

                const submitTx = await signTx.execute(client);
                const receipt = await submitTx.getReceipt(client);
                
                if(receipt.status == Status.Success) {
                    // saving the wallet to the database...
                    walletDocument = new this.walletModel({
                        owner: createWalletRequest.userId,
                        account: {
                            id: receipt.accountId.toString(),
                            balance: null,
                            privateKey: privateKey.toString() // Saved to demo on Hackathon
                        },
                        transactions: []
                    });
        
                    await walletDocument.save();
                    resolve(<Wallet> walletDocument.toJSON());
                } else {
                    throw(new Error(`transaction failed with status ${receipt.status}`));
                }
            } catch(error) {
                reject(error);
            }
        });
    }

    async associateToken(
        associateWalletRequest: IVC.Wallet.Request.Associate
    ): Promise<ISmartNode.ISmartTransaction.IDetails> {
        return new Promise(async(resolve, reject) => {
            try {
                // SMART-NODE CALL: associating a token to the wallet...
                let response = await this.nodeClientService.axios.post(
                    `/hts/associate/${associateWalletRequest.tokenId}/${associateWalletRequest.walletId}`
                );
                let transaction = Transaction.fromBytes(new Uint8Array(Buffer.from(response.data)));

                // signing the transaction and submitting it to the network...
                const client = this.hederaClient.getClient();
                const signTx = await transaction.sign(
                    PrivateKey.fromString(this.smartConfigService.getOperator().privateKey)
                );

                const submitTx = await signTx.execute(client);
                const receipt = await submitTx.getReceipt(client);

                if(receipt.status == Status.Success) {
                    resolve({
                        status: receipt.status.toString(),
                        transactionId: submitTx.transactionId.toString()
                    });
                } else {
                    throw(new Error(`transaction failed with status ${receipt.status}`));
                }
            } catch(error) {
                reject(error);
            }
        });
    }

    async dissociateToken(
        associateWalletRequest: IVC.Wallet.Request.Associate
    ): Promise<ISmartNode.ISmartTransaction.IDetails> {
        return new Promise(async(resolve, reject) => {
            try {
                // SMART-NODE CALL: dissociating a token to the wallet...
                let response = await this.nodeClientService.axios.post(
                    `/hts/dissociate/${associateWalletRequest.tokenId}/${associateWalletRequest.walletId}`
                );
                let transaction = Transaction.fromBytes(new Uint8Array(Buffer.from(response.data)));

                // signing the transaction and submitting it to the network...
                const client = this.hederaClient.getClient();
                const signTx = await transaction.sign(
                    PrivateKey.fromString(this.smartConfigService.getOperator().privateKey)
                );

                const submitTx = await signTx.execute(client);
                const receipt = await submitTx.getReceipt(client);

                if(receipt.status == Status.Success) {
                    resolve({
                        status: receipt.status.toString(),
                        transactionId: submitTx.transactionId.toString()
                    });
                } else {
                    throw(new Error(`transaction failed with status ${receipt.status}`));
                }
            } catch(error) {
                reject(error);
            }
        });
    }

    async withdrawToken(
        withdraw: I_IVC.IWallet.IRequest.IWithdraw
    ): Promise<I_IVC.IWallet.IResponse.IWithdraw> {
        return new Promise(async(resolve, reject) => {
            try {
                // checking if the wallet exists for the given userId...
                let wallet: IVC.Wallet.History = await this.getWallet(withdraw.userId);

                // if the wallet does not exist, then throw an error...
                if (!wallet) {
                    throw(new Error(`wallet not found for user ${withdraw.userId}`));
                }

                // checking if the wallet has sufficient funds...
                let tokenBalance = wallet.balance.tokens.find((token: any) => token.token_id == withdraw.token.id);
                if(new Decimal(tokenBalance.balance).lessThan(withdraw.amount)) {
                    throw(new Error(`insufficient funds on your wallet.`));
                }

                // SMART-NODE CALL: moving funds from user's wallet into a destination wallet...
                let payload: IHedera.ILedger.IHTS.ITransferFungibleToken = {
                    token_id: withdraw.token.id,
                    sender: wallet.id,
                    receiver: withdraw.wallet,
                    amount: withdraw.amount,
                    decimals: withdraw.token.decimals,
                    memo: 'withdraw funds from wallet'
                }

                let response = await this.nodeClientService.axios.post(
                    `/hts/transfer/token`, 
                    payload
                );
                let transaction = Transaction.fromBytes(new Uint8Array(Buffer.from(response.data)));

                // signing the transaction and submitting it to the network...
                const client = this.hederaClient.getClient();
                const signTx = await transaction.sign(
                    PrivateKey.fromString(this.smartConfigService.getOperator().privateKey)
                );

                const submitTx = await signTx.execute(client);
                const receipt = await submitTx.getReceipt(client);

                if(receipt.status == Status.Success) {
                    let withdrawResponse: I_IVC.IWallet.IResponse.IWithdraw = {
                        amount: withdraw.amount,
                        date: moment().unix(),
                        transactionId: submitTx.transactionId.toString().toString(),
                        status: I_IVC.IWallet.IResponse.IWthdrawStatus.COMPLETED
                    };

                    resolve(withdrawResponse);
                } else {
                    throw(new Error(`transaction failed with status ${receipt.status}`));
                }
            } catch(error) {
                reject(error);
            }
        });
    }    

    async deleteWallet(
        userId: string,
        transferAccountId: AccountId
    ): Promise<ISmartNode.ISmartTransaction.IDetails> {
        return new Promise(async(resolve, reject) => {
            try {
                // checking if the wallet exists for the given userId...
                let walletDocument: WalletDocument = await this.walletModel.findOne({
                    owner: userId
                });
        
                // if the wallet does not exist, then throw an error...
                if (!walletDocument) {
                    throw(new Error(`owner ${userId} not found`));
                }

                // SMART-NODE CALL: creating the wallet...
                let response = await this.nodeClientService.axios.delete(`/accounts/${walletDocument.account.id}`, {
                    data: {
                        transferAccountId: transferAccountId.toString()
                    }
                });
                let transaction = Transaction.fromBytes(new Uint8Array(Buffer.from(response.data)));

                // signing the transaction and submitting it to the network...
                const client = this.hederaClient.getClient();
                const signTx = await transaction.sign(
                    PrivateKey.fromString(this.smartConfigService.getOperator().privateKey)
                );

                const submitTx = await signTx.execute(client);
                const receipt = await submitTx.getReceipt(client);

                if(receipt.status == Status.Success) {
                    await walletDocument.deleteOne();

                    resolve({
                        status: receipt.status.toString(),
                        transactionId: submitTx.transactionId.toString()
                    });
                } else {
                    throw(new Error(`transaction failed with status ${receipt.status}`));
                }
            } catch(error) {
                reject(error);
            }
        });
    }
}
