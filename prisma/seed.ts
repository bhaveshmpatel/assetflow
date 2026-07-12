import { PrismaClient, Role, AssetStatus, MaintenanceStatus, AuditStatus, AuditItemCondition, LogType, TransferStatus, BookingStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to generate a random date in the last N months
function getRandomDateInLastMonths(months: number) {
  const date = new Date();
  const pastDate = new Date();
  pastDate.setMonth(pastDate.getMonth() - months);
  return new Date(pastDate.getTime() + Math.random() * (date.getTime() - pastDate.getTime()));
}

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
  // We upsert Users/Departments to keep core accounts stable

  console.log("Database cleared. Seeding rich data for the last 5 months...");

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

  const hrDept = await prisma.department.upsert({
    where: { name: 'Human Resources' },
    update: {},
    create: { name: 'Human Resources' }
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
    where: { email: 'bhavesh@gmail.com' },
    update: { departmentId: engDept.id, role: Role.ADMIN },
    create: {
      name: 'Bhavesh Patel',
      email: 'bhavesh@gmail.com',
      passwordHash,
      employeeId: 'EMP-0003',
      role: Role.ADMIN,
      departmentId: engDept.id,
    }
  });

  const users = [adminUser, managerUser, empUser];
  
  // Create additional mock employees for varied data
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.upsert({
      where: { email: `employee${i}@assetflow.com` },
      update: {},
      create: {
        name: `Employee ${i}`,
        email: `employee${i}@assetflow.com`,
        passwordHash,
        employeeId: `EMP-10${i.toString().padStart(2, '0')}`,
        role: Role.EMPLOYEE,
        departmentId: i % 2 === 0 ? engDept.id : opsDept.id,
      }
    });
    users.push(user);
  }

  // 4. Create Categories
  const catLaptops = await prisma.assetCategory.create({ data: { name: 'Laptops', prefix: 'LAP' } });
  const catRooms = await prisma.assetCategory.create({ data: { name: 'Meeting Rooms', prefix: 'ROOM' } });
  const catVehicles = await prisma.assetCategory.create({ data: { name: 'Vehicles', prefix: 'VEH' } });
  const catCameras = await prisma.assetCategory.create({ data: { name: 'Cameras', prefix: 'CAM' } });
  const catPhones = await prisma.assetCategory.create({ data: { name: 'Mobile Phones', prefix: 'MOB' } });

  const categories = [catLaptops, catRooms, catVehicles, catCameras, catPhones];
  const departments = [engDept, opsDept, hrDept];
  const locations = ['Engineering Hub', 'IT Storage', 'Floor 2', 'Studio A', 'Main Garage', 'HR Office'];

  // 5. Generate Assets (50 assets)
  console.log("Generating Assets...");
  const assets = [];
  for (let i = 1; i <= 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const dept = Math.random() > 0.3 ? departments[Math.floor(Math.random() * departments.length)] : null;
    
    // Distribute statuses
    const randStatus = Math.random();
    let status: AssetStatus = AssetStatus.AVAILABLE;
    if (randStatus > 0.8) status = AssetStatus.UNDER_MAINTENANCE;
    else if (randStatus > 0.3) status = AssetStatus.ALLOCATED;
    else if (randStatus > 0.95) status = AssetStatus.RETIRED;

    const createdAt = getRandomDateInLastMonths(5);

    const asset = await prisma.asset.create({
      data: {
        assetTag: `${category.prefix}-${i.toString().padStart(3, '0')}`,
        name: `${category.name} Item ${i}`,
        serialNumber: `SN-${category.prefix}-${Date.now().toString().slice(-6)}-${i}`,
        status,
        location: locations[Math.floor(Math.random() * locations.length)],
        categoryId: category.id,
        departmentId: dept?.id,
        createdAt,
        updatedAt: new Date(createdAt.getTime() + 1000 * 60 * 60 * 24), // Add 1 day
      }
    });
    assets.push(asset);
  }

  // 6. Generate Allocations & Bookings & Transfers
  console.log("Generating Allocations, Bookings, Transfers...");
  for (const asset of assets) {
    // If it's a room/vehicle, generate bookings
    if (asset.categoryId === catRooms.id || asset.categoryId === catVehicles.id) {
      for (let j = 0; j < 5; j++) {
        const bookDate = getRandomDateInLastMonths(5);
        const endBookDate = new Date(bookDate.getTime() + (Math.random() * 4 + 1) * 3600000); // 1-5 hours later
        await prisma.booking.create({
          data: {
            assetId: asset.id,
            userId: users[Math.floor(Math.random() * users.length)].id,
            startTime: bookDate,
            endTime: endBookDate,
            purpose: `Meeting/Trip ${j}`,
            status: BookingStatus.CONFIRMED,
            createdAt: new Date(bookDate.getTime() - 86400000), // booked 1 day before
          }
        });
      }
    }

    // If it's a laptop/phone/camera and allocated, generate allocations
    if (asset.status === AssetStatus.ALLOCATED && (asset.categoryId === catLaptops.id || asset.categoryId === catPhones.id || asset.categoryId === catCameras.id)) {
      const checkoutDate = getRandomDateInLastMonths(5);
      const user = users[Math.floor(Math.random() * users.length)];
      
      const alloc = await prisma.allocation.create({
        data: {
          assetId: asset.id,
          userId: user.id,
          departmentId: user.departmentId,
          assignedById: managerUser.id,
          checkoutDate,
        }
      });
      await prisma.asset.update({
        where: { id: asset.id },
        data: { currentAllocationId: alloc.id }
      });

      // Generate a transfer request for 20% of allocated items
      if (Math.random() > 0.8) {
        const transferDate = new Date(checkoutDate.getTime() + 86400000 * 5); // 5 days later
        if (transferDate < new Date()) {
          const targetUser = users.find(u => u.id !== user.id) || users[0];
          await prisma.transferRequest.create({
            data: {
              allocationId: alloc.id,
              targetUserId: targetUser.id,
              requestedById: user.id,
              status: Math.random() > 0.5 ? TransferStatus.APPROVED : TransferStatus.PENDING,
              managerNotes: 'Project handover',
              createdAt: transferDate,
              updatedAt: transferDate
            }
          });
        }
      }
    }
  }

  // 7. Generate Maintenance Requests (30 requests over 5 months)
  console.log("Generating Maintenance Requests...");
  for (let i = 0; i < 30; i++) {
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const reqDate = getRandomDateInLastMonths(5);
    
    // 30% pending, 30% in progress, 40% completed
    const isResolved = Math.random() > 0.4;
    let status: MaintenanceStatus = MaintenanceStatus.PENDING;
    let compDate: Date | null = null;
    if (isResolved) {
      status = MaintenanceStatus.RESOLVED;
      compDate = new Date(reqDate.getTime() + 86400000 * (Math.random() * 5 + 1)); // 1-6 days later
    } else if (Math.random() > 0.5) {
      status = MaintenanceStatus.IN_PROGRESS;
    }

    await prisma.maintenanceRequest.create({
      data: {
        assetId: asset.id,
        reportedById: users[Math.floor(Math.random() * users.length)].id,
        approvedById: status !== MaintenanceStatus.PENDING ? adminUser.id : null,
        technicianName: status !== MaintenanceStatus.PENDING ? 'Dave Repair' : null,
        description: `Routine issue ${i} or breakdown.`,
        status,
        cost: status === MaintenanceStatus.RESOLVED ? Math.floor(Math.random() * 500) + 50 : null,
        createdAt: reqDate,
        resolvedAt: compDate,
      }
    });
  }

  // 8. Generate Audit Cycles (One per month for last 5 months)
  console.log("Generating Audit Cycles...");
  for (let m = 0; m < 5; m++) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - m);
    startDate.setDate(1); // 1st of the month
    
    const isPast = m > 0;
    
    const audit = await prisma.auditCycle.create({
      data: {
        title: `Monthly Audit ${startDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        status: isPast ? AuditStatus.COMPLETED : AuditStatus.ACTIVE,
        initiatedById: adminUser.id,
        startDate,
        endDate: isPast ? new Date(startDate.getTime() + 86400000 * 7) : null, // 7 days later
      }
    });

    // Pick 10 random assets to audit
    const shuffledAssets = [...assets].sort(() => 0.5 - Math.random());
    const selectedAssets = shuffledAssets.slice(0, 10);

    for (const asset of selectedAssets) {
      const condRand = Math.random();
      let condition: AuditItemCondition = AuditItemCondition.VERIFIED;
      
      if (isPast) {
        if (condRand > 0.2) condition = AuditItemCondition.VERIFIED;
        else if (condRand > 0.1) condition = AuditItemCondition.DAMAGED;
        else condition = AuditItemCondition.MISSING;
      } else {
        condition = AuditItemCondition.VERIFIED;
      }

      await prisma.auditItem.create({
        data: {
          auditCycleId: audit.id,
          assetId: asset.id,
          condition,
          notes: condition === AuditItemCondition.DAMAGED ? 'Minor scratches' : null,
          verifiedById: adminUser.id,
        }
      });
    }
  }

  // 9. Generate Activity Logs (100 logs over 5 months)
  console.log("Generating Activity Logs...");
  const logs = [];
  for (let i = 0; i < 100; i++) {
    const logDate = getRandomDateInLastMonths(5);
    const randType = Math.random();
    let type: LogType = LogType.SYSTEM;
    let desc = 'Routine system scan completed';
    const user = users[Math.floor(Math.random() * users.length)];

    if (randType > 0.8) {
      type = LogType.ALERT;
      desc = `Alert: Asset SLA breached for maintenance`;
    } else if (randType > 0.5) {
      type = LogType.BOOKING;
      desc = `Asset booking confirmed for user`;
    } else if (randType > 0.3) {
      type = LogType.APPROVAL;
      desc = `Asset allocation approved by manager`;
    }

    logs.push({
      userId: randType > 0.8 ? null : user.id, // alerts might be system generated
      actionDescription: desc,
      type,
      createdAt: logDate,
    });
  }
  await prisma.activityLog.createMany({ data: logs });

  console.log("Database successfully seeded with 5 months of rich data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
