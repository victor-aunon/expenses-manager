import { DomainError } from "../errors/domain.error";

export interface CreateMemberProps {
  id: string;
  name: string;
  createdAt?: Date;
}

export class Member {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _createdAt: Date;

  private constructor(props: CreateMemberProps) {
    if (!props.id || typeof props.id !== "string" || props.id.trim() === "") {
      throw new DomainError("Member ID is required");
    }

    if (!props.name || typeof props.name !== "string" || props.name.trim() === "") {
      throw new DomainError("Member name is required and cannot be empty");
    }

    if (props.name.length > 100) {
      throw new DomainError("Member name cannot exceed 100 characters");
    }

    this._id = props.id;
    this._name = props.name.trim();
    this._createdAt = props.createdAt || new Date();
    Object.freeze(this);
  }

  public static create(props: CreateMemberProps): Member {
    return new Member(props);
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }
}
