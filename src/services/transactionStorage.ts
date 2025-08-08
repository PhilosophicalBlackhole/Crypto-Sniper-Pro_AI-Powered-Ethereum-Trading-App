/**
 * Transaction storage service for managing user trade history
 */

import { Transaction } from '../types/trading';

interface TransactionPage {
  transactions: Transaction[];
  page: number;
  totalPages: number;
  totalTransactions: number;
}

/**
 * Transaction Storage Service
 */
export class TransactionStorageService {
  private readonly STORAGE_KEY_PREFIX = 'cryptosniper_transactions_';
  private readonly STORAGE_META_KEY = 'cryptosniper_tx_meta_';
  private readonly MAX_TRANSACTIONS_PER_PAGE = 25;
  private readonly MIN_DASHBOARD_DISPLAY = 10;
  private readonly MAX_RAM_TRANSACTIONS = 100; // Keep max 100 in memory

  /**
   * Save transaction to user's history
   */
  saveTransaction(userId: string, transaction: Transaction): void {
    try {
      const meta = this.getTransactionMeta(userId);
      const currentPage = Math.floor(meta.totalTransactions / this.MAX_TRANSACTIONS_PER_PAGE);
      
      // Get current page transactions
      const pageTransactions = this.getTransactionPage(userId, currentPage);
      
      // Add new transaction at the beginning
      pageTransactions.unshift(transaction);
      
      // If page is full, move oldest to next page
      if (pageTransactions.length > this.MAX_TRANSACTIONS_PER_PAGE) {
        const overflow = pageTransactions.splice(this.MAX_TRANSACTIONS_PER_PAGE);
        this.saveTransactionPage(userId, currentPage + 1, overflow);
      }
      
      // Save current page
      this.saveTransactionPage(userId, currentPage, pageTransactions);
      
      // Update metadata
      meta.totalTransactions++;
      meta.totalPages = Math.ceil(meta.totalTransactions / this.MAX_TRANSACTIONS_PER_PAGE);
      meta.lastUpdated = Date.now();
      
      this.saveTransactionMeta(userId, meta);
      
      console.log(`💾 Transaction saved for user ${userId}`);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  }

  /**
   * Get transactions for dashboard display (most recent, limited)
   */
  getDashboardTransactions(userId: string): Transaction[] {
    try {
      const meta = this.getTransactionMeta(userId);
      if (meta.totalTransactions === 0) return [];
      
      // Get first page (most recent)
      const firstPage = this.getTransactionPage(userId, 0);
      
      // Return minimum display amount or less
      return firstPage.slice(0, this.MIN_DASHBOARD_DISPLAY);
    } catch (error) {
      console.error('Error loading dashboard transactions:', error);
      return [];
    }
  }

  /**
   * Get paginated transaction history
   */
  getTransactionHistory(userId: string, page: number = 0): TransactionPage {
    try {
      const meta = this.getTransactionMeta(userId);
      const transactions = this.getTransactionPage(userId, page);
      
      return {
        transactions,
        page,
        totalPages: meta.totalPages,
        totalTransactions: meta.totalTransactions
      };
    } catch (error) {
      console.error('Error loading transaction history:', error);
      return {
        transactions: [],
        page: 0,
        totalPages: 0,
        totalTransactions: 0
      };
    }
  }

  /**
   * Get user transaction statistics
   */
  getTransactionStats(userId: string): {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    totalProfit: number;
    successRate: number;
  } {
    try {
      const meta = this.getTransactionMeta(userId);
      const recentTransactions = this.getDashboardTransactions(userId);
      
      const successful = recentTransactions.filter(tx => tx.status === 'success').length;
      const failed = recentTransactions.filter(tx => tx.status === 'failed').length;
      const pending = recentTransactions.filter(tx => tx.status === 'pending').length;
      
      const totalProfit = recentTransactions
        .filter(tx => tx.profit !== undefined)
        .reduce((sum, tx) => sum + (tx.profit || 0), 0);
      
      const completedTransactions = successful + failed;
      const successRate = completedTransactions > 0 ? (successful / completedTransactions) * 100 : 0;
      
      return {
        total: meta.totalTransactions,
        successful,
        failed,
        pending,
        totalProfit,
        successRate
      };
    } catch (error) {
      console.error('Error calculating transaction stats:', error);
      return {
        total: 0,
        successful: 0,
        failed: 0,
        pending: 0,
        totalProfit: 0,
        successRate: 0
      };
    }
  }

  /**
   * Clear old transactions to manage memory
   */
  cleanupOldTransactions(userId: string): void {
    try {
      const meta = this.getTransactionMeta(userId);
      
      // If total transactions exceed RAM limit, remove oldest pages
      if (meta.totalTransactions > this.MAX_RAM_TRANSACTIONS) {
        const pagesToKeep = Math.ceil(this.MAX_RAM_TRANSACTIONS / this.MAX_TRANSACTIONS_PER_PAGE);
        const pagesToDelete = meta.totalPages - pagesToKeep;
        
        // Remove oldest pages
        for (let page = meta.totalPages - 1; page >= pagesToKeep; page--) {
          localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${userId}_page_${page}`);
        }
        
        // Update metadata
        meta.totalPages = pagesToKeep;
        meta.totalTransactions = this.MAX_RAM_TRANSACTIONS;
        this.saveTransactionMeta(userId, meta);
        
        console.log(`🧹 Cleaned up ${pagesToDelete} transaction pages for user ${userId}`);
      }
    } catch (error) {
      console.error('Error cleaning up transactions:', error);
    }
  }

  /**
   * Export transaction history for user
   */
  exportTransactionHistory(userId: string): string {
    try {
      const meta = this.getTransactionMeta(userId);
      const allTransactions: Transaction[] = [];
      
      // Collect all transactions from all pages
      for (let page = 0; page < meta.totalPages; page++) {
        const pageTransactions = this.getTransactionPage(userId, page);
        allTransactions.push(...pageTransactions);
      }
      
      return JSON.stringify({
        userId,
        exportDate: new Date().toISOString(),
        totalTransactions: allTransactions.length,
        transactions: allTransactions
      }, null, 2);
    } catch (error) {
      console.error('Error exporting transaction history:', error);
      return '{}';
    }
  }

  // Private helper methods
  private getStorageKey(userId: string, page: number): string {
    return `${this.STORAGE_KEY_PREFIX}${userId}_page_${page}`;
  }

  private getMetaKey(userId: string): string {
    return `${this.STORAGE_META_KEY}${userId}`;
  }

  private getTransactionPage(userId: string, page: number): Transaction[] {
    try {
      const key = this.getStorageKey(userId, page);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  private saveTransactionPage(userId: string, page: number, transactions: Transaction[]): void {
    const key = this.getStorageKey(userId, page);
    localStorage.setItem(key, JSON.stringify(transactions));
  }

  private getTransactionMeta(userId: string): {
    totalTransactions: number;
    totalPages: number;
    lastUpdated: number;
  } {
    try {
      const key = this.getMetaKey(userId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : {
        totalTransactions: 0,
        totalPages: 0,
        lastUpdated: Date.now()
      };
    } catch (error) {
      return {
        totalTransactions: 0,
        totalPages: 0,
        lastUpdated: Date.now()
      };
    }
  }

  private saveTransactionMeta(userId: string, meta: {
    totalTransactions: number;
    totalPages: number;
    lastUpdated: number;
  }): void {
    const key = this.getMetaKey(userId);
    localStorage.setItem(key, JSON.stringify(meta));
  }
}

/**
 * Singleton instance
 */
export const transactionStorage = new TransactionStorageService();
