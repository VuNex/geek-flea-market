import { AppDataSource } from '../data-source';
import { PaidService } from '../entities/PaidService';

export class BillingService {
    private paidServiceRepository = AppDataSource.getRepository(PaidService);

    async getServicesByAdvertId(advertId: number) {
        return this.paidServiceRepository.find({
            where: { advertId },
            order: { activatedAt: 'DESC' },
        });
    }

    async toggleServiceActiveStatus(advertId: number, serviceId: number, isActive: boolean) {
        const service = await this.paidServiceRepository.findOne({
            where: { id: serviceId, advertId },
        });

        if (!service) {
            return null; // Not found
        }

        service.isActive = isActive;
        return this.paidServiceRepository.save(service);
    }
}
