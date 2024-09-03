-- CreateEnum
CREATE TYPE "status" AS ENUM ('Activated', 'ActivationReady', 'Deactivated', 'Inventory', 'Purged', 'Replaced', 'Retired', 'TestReady', 'Processing');

-- CreateTable
CREATE TABLE "sim_role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sim_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sim_user" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sim_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "net_jasper_devices" (
    "iccid" TEXT NOT NULL,
    "status" TEXT,
    "imei" TEXT,
    "msisdn" TEXT,
    "modem_id" TEXT,
    "ratePlan" TEXT,
    "communicationPlan" TEXT,
    "company_id" INTEGER,
    "company_name" TEXT,
    "tracker_id" TEXT,
    "customer" TEXT,
    "date_updated" TIMESTAMP(3),
    "ctdDataUsage" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "net_jasper_devices_pkey" PRIMARY KEY ("iccid")
);

-- CreateTable
CREATE TABLE "net_kore_devices" (
    "iccid" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "apn_feature" TEXT,
    "rate_plan" TEXT,
    "session_status" TEXT,
    "eid" TEXT,
    "service_type" TEXT,
    "msisdn" TEXT,
    "imsi" TEXT,
    "imei" TEXT,
    "product_offer" TEXT,
    "provisioning_request_id" TEXT,
    "rsp_state" TEXT,
    "product_offer_type" TEXT,
    "serial" TEXT,
    "model" TEXT,
    "cost_center_id" TEXT,
    "ip_address" TEXT,
    "apn_id" TEXT,
    "data_usage" DOUBLE PRECISION,
    "sms_usage" DOUBLE PRECISION,
    "voice_usage" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "net_kore_devices_pkey" PRIMARY KEY ("iccid")
);

-- CreateIndex
CREATE UNIQUE INDEX "sim_role_name_key" ON "sim_role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sim_user_email_key" ON "sim_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "net_kore_devices_subscription_id_key" ON "net_kore_devices"("subscription_id");

-- AddForeignKey
ALTER TABLE "sim_user" ADD CONSTRAINT "sim_user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "sim_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
