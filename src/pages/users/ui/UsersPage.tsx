import { AppBreadcrumb } from "@/widgets/app-breadcrumb";
import { EmployeesTable } from "@/widgets/employees-table";

export function UsersPage() {
  return (
    <>
      <AppBreadcrumb pageName="Employees" />
      <EmployeesTable employees={[]} />
    </>
  );
}
