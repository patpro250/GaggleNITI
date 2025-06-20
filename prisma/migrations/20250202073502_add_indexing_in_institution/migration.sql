-- CreateIndex
CREATE INDEX "institutions_name_email_address_phone_idx" ON "institutions"("name", "email", "address", "phone");
