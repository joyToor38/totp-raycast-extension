import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { generate } from "otplib";

interface SignUpFormValues {
  name: string;
}

export default function Command() {
  const { handleSubmit, itemProps } = useForm<SignUpFormValues>({
    async onSubmit(values) {
      const {pop} = useNavigation()
      const secret = await generate({secret: values.name})
      console.log(secret)
      showToast({
        style: Toast.Style.Success,
        title: "Yay!",
        message: `${values.name} account created`,
      });
      pop()
    },
    validation: {
      name: FormValidation.Required,
      // password: (value) => {
      //   if (value && value.length < 8) {
      //     return "Password must be at least 8 symbols";
      //   } else if (!value) {
      //     return "The item is required";
      //   }
      // },
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
      <Form.TextField title="Full Name" placeholder="Tim Cook" {...itemProps.name} />
    </Form>
  );
}
