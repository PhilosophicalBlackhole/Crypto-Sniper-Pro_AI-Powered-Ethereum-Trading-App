/**
 * Wix Velo backend functions for CryptoSniperPro
 * Place this file in your Wix site's backend folder
 */

import { Permissions, webMethod } from 'wix-web-module';
import wixData from 'wix-data';
import { members } from 'wix-members';

/**
 * Get current member information
 */
export const getCurrentMember = webMethod(Permissions.SiteMember, async () => {
  try {
    const user = await members.getCurrentMember();
    
    if (!user) {
      return null;
    }

    // Get member's subscription plan
    const memberPlans = await members.getMemberRoles(user._id);
    const plan = memberPlans.length > 0 ? memberPlans[0].name.toLowerCase() : 'free';

    return {
      id: user._id,
      name: `${user.contactDetails.firstName || ''} ${user.contactDetails.lastName || ''}`.trim(),
      email: user.loginEmail,
      plan: plan,
      avatar: user.picture || null
    };
  } catch (error) {
    console.error('Error getting current member:', error);
    return null;
  }
});

/**
 * Save snipe configuration
 */
export const saveSnipeConfig = webMethod(Permissions.SiteMember, async (configData) => {
  try {
    const user = await members.getCurrentMember();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const config = {
      ...configData,
      userId: user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsed: configData.lastUsed || Date.now(),
      favorite: configData.favorite || false
    };

    const result = await wixData.save('CryptoSnipeConfigs', config);
    return result;
  } catch (error) {
    console.error('Error saving snipe config:', error);
    throw error;
  }
});

/**
 * Get user's snipe configurations
 */
export const getSnipeConfigs = webMethod(Permissions.SiteMember, async () => {
  try {
    const user = await members.getCurrentMember();
    
    if (!user) {
      return [];
    }

    const results = await wixData.query('CryptoSnipeConfigs')
      .eq('userId', user._id)
      .descending('lastUsed')
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting snipe configs:', error);
    return [];
  }
});

/**
 * Update snipe configuration
 */
export const updateSnipeConfig = webMethod(Permissions.SiteMember, async (configId, updates) => {
  try {
    const user = await members.getCurrentMember();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify ownership
    const existing = await wixData.get('CryptoSnipeConfigs', configId);
    if (existing.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    const updatedConfig = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    const result = await wixData.update('CryptoSnipeConfigs', updatedConfig);
    return result;
  } catch (error) {
    console.error('Error updating snipe config:', error);
    throw error;
  }
});

/**
 * Delete snipe configuration
 */
export const deleteSnipeConfig = webMethod(Permissions.SiteMember, async (configId) => {
  try {
    const user = await members.getCurrentMember();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify ownership
    const existing = await wixData.get('CryptoSnipeConfigs', configId);
    if (existing.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    await wixData.remove('CryptoSnipeConfigs', configId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting snipe config:', error);
    throw error;
  }
});

/**
 * Save transaction record
 */
export const saveTransaction = webMethod(Permissions.SiteMember, async (transactionData) => {
  try {
    const user = await members.getCurrentMember();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const transaction = {
      ...transactionData,
      userId: user._id,
      createdAt: new Date()
    };

    const result = await wixData.save('CryptoTransactions', transaction);
    return result;
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
});

/**
 * Get user's transaction history
 */
export const getTransactionHistory = webMethod(Permissions.SiteMember, async (limit = 50) => {
  try {
    const user = await members.getCurrentMember();
    
    if (!user) {
      return [];
    }

    const results = await wixData.query('CryptoTransactions')
      .eq('userId', user._id)
      .descending('createdAt')
      .limit(limit)
      .find();

    return results.items;
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return [];
  }
});
