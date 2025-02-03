function institutionSettings() {
  return {
    settings: {
      circulation: {
        maxLoanPeriod: 14,
        maxRenewals: 3,
        lateFeePerDay: 0.5,
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
      libraryLayout: {
        seatingCapacity: 0,
        studyAreas: 0,
        meetingRooms: 0,
        quietArea: true,
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
    },
  };
}

module.exports = institutionSettings;
