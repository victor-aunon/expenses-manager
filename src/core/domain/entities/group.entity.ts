import { DomainError } from "../errors/domain.error";
import { Member } from "./member.entity";

export interface CreateGroupProps {
  id: string;
  name: string;
  members?: Member[];
  createdAt?: Date;
}

export class Group {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _members: Member[];
  private readonly _createdAt: Date;

  private constructor(props: CreateGroupProps) {
    if (!props.id || typeof props.id !== "string" || props.id.trim() === "") {
      throw new DomainError("Group ID is required");
    }

    if (!props.name || typeof props.name !== "string" || props.name.trim() === "") {
      throw new DomainError("Group name is required and cannot be empty");
    }

    if (props.name.length > 100) {
      throw new DomainError("Group name cannot exceed 100 characters");
    }

    this._id = props.id;
    this._name = props.name.trim();
    this._members = props.members ? [...props.members] : [];
    this._createdAt = props.createdAt || new Date();
    Object.freeze(this);
  }

  public static create(props: CreateGroupProps): Group {
    return new Group(props);
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get members(): Member[] {
    return [...this._members];
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public addMember(member: Member): Group {
    // Check duplicate by ID
    const existsById = this._members.some((m) => m.id === member.id);
    if (existsById) {
      throw new DomainError(
        `Member with ID '${member.id}' already exists in group '${this._name}'`
      );
    }

    // Check duplicate by Name (case-insensitive)
    const existsByName = this._members.some(
      (m) => m.name.toLowerCase() === member.name.toLowerCase()
    );
    if (existsByName) {
      throw new DomainError(
        `Member with name '${member.name}' already exists in group '${this._name}'`
      );
    }

    return new Group({
      id: this._id,
      name: this._name,
      members: [...this._members, member],
      createdAt: this._createdAt,
    });
  }
}
