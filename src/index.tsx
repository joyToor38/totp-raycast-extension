import { Action, ActionPanel, Form, popToRoot, showToast, Toast, LocalStorage, useNavigation } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { TOTPOptions } from "otplib";

interface SignUpFormValues {
  totpURL?: string;
  secret?: string;
  issuer?:string;
}

function parseTotpURL(totpUrl: string): TOTPOptions {
  const url = new URL(totpUrl);
  if (url.protocol !== "otpauth:") {
    throw Error;
  }
  const options = Object.fromEntries(url.searchParams);
  return options;
}

export default function Command() {
  const { push } = useNavigation();
  const { handleSubmit, itemProps } = useForm<SignUpFormValues>({
    async onSubmit(values) {
      const options = parseTotpURL(values.totpURL as string);
      await LocalStorage.setItem(options.issuer as string, options.secret as string);
      showToast({
        style: Toast.Style.Success,
        title: "Yay!",
        message: `TOTP Registered Successfully`,
      });
      popToRoot()
      // push()
    },
    validation: {
      totpURL: FormValidation.Required,
    },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        title="TOTP URL"
        placeholder="otpauth://totp/Test:demo?secret=TESTSECRET123&issuer=Test"
        {...itemProps.totpURL}
      />
      <Form.Separator />
      <Form.TextField title="Secret" placeholder="SDFJKDSJFSD" {...itemProps.secret} />
      <Form.TextField title="Issuer" placeholder="github.com" {...itemProps.issuer} />
    </Form>
  );
}
