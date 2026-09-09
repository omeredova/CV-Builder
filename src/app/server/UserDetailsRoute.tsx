import { employeeQuery, type EmployeeQueryData } from "@/entities/employee";
import { UserDetailsPage, type UserProfileTab } from "@/pages/users";
import { PreloadQuery } from "../providers/apollo/serverClient";
import { ApolloDataBoundary } from "@/shared/api/graphql/ApolloDataBoundary";
import { getEmployeeTabRequest } from "./employeeTabRequest";

interface UserDetailsRouteProps {
  userId: string;
  initialTab?: UserProfileTab;
}

export function UserDetailsRoute({ userId, initialTab = "profile" }: UserDetailsRouteProps) {
  return (
    <PreloadQuery<EmployeeQueryData, { id: string }> query={employeeQuery} variables={{ id: userId }}>
      {(employeeRef) => (
        <PreloadQuery {...getEmployeeTabRequest(userId, initialTab)}>
          {(tabRef) => (
            <ApolloDataBoundary queryRef={employeeRef}>
              <UserDetailsPage tabQueryRef={tabRef} userId={userId} initialTab={initialTab} />
            </ApolloDataBoundary>
          )}
        </PreloadQuery>
      )}
    </PreloadQuery>
  );
}
