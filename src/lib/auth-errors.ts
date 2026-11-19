import { CredentialsSignin } from "@auth/core/errors";

export class BlockedAccountError extends CredentialsSignin {
  code = "account_disabled";
}
