import { RoleName } from 'src/common/constants/role.constant'
import envConfig from 'src/configs/validation'
import { HashService } from 'src/libs/crypto/hash.service'
import { PrismaService } from 'src/prisma/prisma.service'

const prisma = new PrismaService()
const hashService = new HashService()
const main = async () => {
  const roleCount = await prisma.role.count()
  if (roleCount > 0) {
    throw new Error('Roles already exits')
  }

  const roles = await prisma.role.createMany({
    data: [
      {
        name: RoleName.Admin,
        description: 'Admin role',
      },
      {
        name: RoleName.Admin,
        description: 'Client role',
      },
      {
        name: RoleName.Seller,
        description: 'Seller role',
      },
    ],
  })

  const adminRole = await prisma.role.findFirstOrThrow({
    where: {
      name: RoleName.Admin,
    },
  })

  const hashPassword = await hashService.hash(envConfig.ADMIN_PASSWORD)
  const adminUser = await prisma.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: hashPassword,
      name: envConfig.ADMIN_NAME,
      phoneNumber: envConfig.ADMIN_PHONENUMBER,
      roleId: adminRole.id,
    },
  })

  return {
    createdRoleCount: roles.count,
    adminUser,
  }
}

void main()
  .then(({ adminUser, createdRoleCount }) => {
    console.log(`Created ${createdRoleCount} roles`)
    console.log(`Created admin user: ${adminUser.email}`)
  })
  .catch(console.error)
