import prisma from '@/lib/prisma';

export const jasperService = {
  getCustomerSimCards: async () => {
    try {
      const jasperSims = await prisma.netJasperDevices.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return {
        simCards: jasperSims,
      };
    } catch (error) {
      console.error('Error fetching Jasper SIM cards from database:', error);
      throw error;
    }
  },

  changeSimStatus: async (iccid: string, status: string) => {
    try {
      const updatedSim = await prisma.netJasperDevices.update({
        where: { iccid: iccid },
        data: { status: status },
      });

      return {
        success: true,
        message: `Jasper SIM status changed to ${status}`,
        updatedSim: updatedSim,
      };
    } catch (error) {
      console.error('Error in change Jasper SimStatus:', error);
      throw error;
    }
  },

  searchSimByIccid: async (iccid: string) => {
    try {
      const sim = await prisma.netJasperDevices.findUnique({
        where: { iccid },
      });

      return sim ? { simCards: [sim] } : { simCards: [] };
    } catch (error) {
      console.error('Error searching Jasper SIM by ICCID:', error);
      throw error;
    }
  },

  getStatusCounts: async () => {
    try {
      const counts = await prisma.netJasperDevices.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      });

      const result = {
        Activated: 0,
        Deactivated: 0,
        Inventory: 0,
        Purged: 0,
        Replaced: 0,
        Retired: 0,
        'Test Ready': 0,
        Unknown: 0,
      };

      counts.forEach((count) => {
        result[count.status as keyof typeof result] = count._count.status;
      });

      return result;
    } catch (error) {
      console.error('Error fetching Jasper status counts:', error);
      throw error;
    }
  },
};
