import { PrismaClient, Role, AssetStatus, MaintenanceStatus, AuditStatus, AuditItemCondition, LogType, TransferStatus, BookingStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Clean existing data (safely handle constraints)
  await prisma.auditItem.deleteMany();
  await prisma.auditCycle.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.transferRequest.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.assetCategory.deleteMany();
  // We don't delete Users immediately because there might be self-references, but wait, Department has managerId pointing to User.
  // Instead of deleting users, we'll upsert them.

  console.log("Database cleared (mostly). Seeding new data...");

  const passwordHash = await hash('password123', 10);

  // 2. Upsert Departments
  const engDept = await prisma.department.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: { name: 'Engineering' }
  });
  
  const opsDept = await prisma.department.upsert({
    where: { name: 'Operations' },
    update: {},
    create: { name: 'Operations' }
  });

  // 3. Upsert Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@assetflow.com' },
    update: { departmentId: opsDept.id, role: Role.ADMIN },
    create: {
      name: 'System Admin',
      email: 'admin@assetflow.com',
      passwordHash,
      employeeId: 'EMP-0001',
      role: Role.ADMIN,
      departmentId: opsDept.id,
    }
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@assetflow.com' },
    update: { departmentId: engDept.id, role: Role.ASSET_MANAGER },
    create: {
      name: 'Asset Manager',
      email: 'manager@assetflow.com',
      passwordHash,
      employeeId: 'EMP-0002',
      role: Role.ASSET_MANAGER,
      departmentId: engDept.id,
    }
  });

  const empUser = await prisma.user.upsert({
    where: { email: 'bhavesh@gmail.com' }, // Based on earlier conversation where user mentioned this email
    update: { departmentId: engDept.id, role: Role.ADMIN }, // Escalated to Admin for testing
    create: {
      name: 'Bhavesh Patel',
      email: 'bhavesh@gmail.com',
      passwordHash,
      employeeId: 'EMP-0003',
      role: Role.ADMIN,
      departmentId: engDept.id,
    }
  });

  const standardEmp = await prisma.user.upsert({
    where: { email: 'employee@assetflow.com' },
    update: { departmentId: engDept.id, role: Role.EMPLOYEE },
    create: {
      name: 'Standard Employee',
      email: 'employee@assetflow.com',
      passwordHash,
      employeeId: 'EMP-0004',
      role: Role.EMPLOYEE,
      departmentId: engDept.id,
    }
  });

  // 4. Create Categories
  const catLaptops = await prisma.assetCategory.create({
    data: { name: 'Laptops', prefix: 'LAP' }
  });
  const catRooms = await prisma.assetCategory.create({
    data: { name: 'Meeting Rooms', prefix: 'ROOM' }
  });
  const catVehicles = await prisma.assetCategory.create({
    data: { name: 'Vehicles', prefix: 'VEH' }
  });
  const catCameras = await prisma.assetCategory.create({
    data: { name: 'Cameras', prefix: 'CAM' }
  });

  // 5. Create Assets
  const asset1 = await prisma.asset.create({
    data: {
      assetTag: 'LAP-001',
      name: 'MacBook Pro 16" M3 Max',
      serialNumber: 'SN-MP16M3-001',
      status: AssetStatus.ALLOCATED,
      location: 'Engineering Hub',
      categoryId: catLaptops.id,
      departmentId: engDept.id,
    }
  });

  const asset2 = await prisma.asset.create({
    data: {
      assetTag: 'LAP-002',
      name: 'MacBook Air 15" M2',
      serialNumber: 'SN-MA15M2-002',
      status: AssetStatus.AVAILABLE,
      location: 'IT Storage',
      categoryId: catLaptops.id,
      departmentId: opsDept.id,
    }
  });

  const assetRoom = await prisma.asset.create({
    data: {
      assetTag: 'ROOM-B2',
      name: 'Boardroom B2 (10 Pax)',
      status: AssetStatus.AVAILABLE,
      location: 'Floor 2',
      categoryId: catRooms.id,
    }
  });

  const assetCam = await prisma.asset.create({
    data: {
      assetTag: 'CAM-001',
      name: 'Sony A7S III',
      serialNumber: 'SN-SONY-A7S-1',
      status: AssetStatus.UNDER_MAINTENANCE,
      location: 'Studio A',
      categoryId: catCameras.id,
    }
  });

  // 6. Create Allocations (Active allocation for asset1)
  const alloc1 = await prisma.allocation.create({
    data: {
      assetId: asset1.id,
      userId: empUser.id,
      departmentId: engDept.id,
      assignedById: managerUser.id,
      checkoutDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    }
  });
  
  // Set the current allocation link
  await prisma.asset.update({
    where: { id: asset1.id },
    data: { currentAllocationId: alloc1.id }
  });

  // 7. Create Maintenance Requests
  await prisma.maintenanceRequest.create({
    data: {
      assetId: assetCam.id,
      reportedById: standardEmp.id,
      approvedById: adminUser.id,
      technicianName: 'Dave Repair',
      description: 'Sensor needs cleaning and lens is stuck.',
      status: MaintenanceStatus.IN_PROGRESS,
      cost: 150.00,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    }
  });

  // 8. Create Bookings
  await prisma.booking.create({
    data: {
      assetId: assetRoom.id,
      userId: empUser.id,
      startTime: new Date(new Date().setHours(14, 0, 0, 0)),
      endTime: new Date(new Date().setHours(15, 0, 0, 0)),
      purpose: 'Quarterly Planning Sync',
      status: BookingStatus.CONFIRMED
    }
  });

  await prisma.booking.create({
    data: {
      assetId: assetRoom.id,
      userId: standardEmp.id,
      startTime: new Date(new Date().setHours(10, 0, 0, 0)),
      endTime: new Date(new Date().setHours(11, 30, 0, 0)),
      purpose: 'Design Review',
      status: BookingStatus.CONFIRMED
    }
  });

  // 9. Create Audit Cycle
  const audit = await prisma.auditCycle.create({
    data: {
      title: 'Q3 Asset Verification (Engineering)',
      status: AuditStatus.ACTIVE,
      initiatedById: adminUser.id,
      startDate: new Date(),
    }
  });

  // 10. Create Audit Items for the cycle
  await prisma.auditItem.create({
    data: {
      auditCycleId: audit.id,
      assetId: asset1.id,
      condition: AuditItemCondition.VERIFIED,
      notes: 'Currently with Bhavesh',
    }
  });
  
  await prisma.auditItem.create({
    data: {
      auditCycleId: audit.id,
      assetId: asset2.id,
      condition: AuditItemCondition.VERIFIED, // We'll leave it verified to start with, or user can change it
    }
  });

  // 11. Create Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: managerUser.id,
        actionDescription: `Allocated ${asset1.assetTag} to ${empUser.name}`,
        type: LogType.SYSTEM,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        actionDescription: `Initiated ${audit.title}`,
        type: LogType.SYSTEM,
        createdAt: new Date(),
      },
      {
        userId: empUser.id,
        actionDescription: `Booking confirmed : ${assetRoom.assetTag} : 2:00 PM to 3:00 PM`,
        type: LogType.BOOKING,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        userId: adminUser.id,
        actionDescription: `Maintenance request ${assetCam.assetTag} approved`,
        type: LogType.APPROVAL,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        userId: null,
        actionDescription: `Overdue return: LAP-009 was due 3 days ago`,
        type: LogType.ALERT,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      }
    ]
  });

  console.log("Database seeded successfully with rich mock data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
