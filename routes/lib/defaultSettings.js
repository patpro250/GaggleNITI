function institutionSettings() {
  return {
    settings: {
      circulation: {
        maxLoanPeriod: 14,
        maxRenewals: 3,
        lateFeePerDay: 100,
        reserveBook: true,
        overdueGracePeriod: 0,
      },
      notification: {
        emailNotifications: true,
        smsNotifications: true,
        reminderDaysBeforeDue: 3,
      },
      acquisitions: {
        budgetLimit: 0,
        purchaseRequestsAllowed: true,
      },
      userPermissions: {
        borrowerLimit: 3,
        canReserveBooks: true,
        canRequestBookAcquisitions: false,
      },
      security: {
        requireLibraryCard: false,
        allowGuestAccess: false,
        patronActivityTracking: true,
      },
      condition: {
        notNew: 30,
        old: 10,
      },
    },
  };
}

module.exports = institutionSettings;
