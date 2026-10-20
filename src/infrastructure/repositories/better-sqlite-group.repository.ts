import Database from "better-sqlite3";
import {
  GroupData,
  IGroupRepository,
  MemberData,
} from "@/core/domain/ports/group-repository.port";

export class BetterSqliteGroupRepository implements IGroupRepository {
  constructor(private readonly db: Database.Database) {}

  public async findById(id: string): Promise<GroupData | null> {
    const groupRow = this.db
      .prepare(`SELECT id, name, created_at FROM groups WHERE id = ?`)
      .get(id) as any;

    if (!groupRow) {
      return null;
    }

    const members = this.getMembersForGroup(id);

    return {
      id: groupRow.id,
      name: groupRow.name,
      members,
      createdAt: groupRow.created_at,
    };
  }

  public async findByName(name: string): Promise<GroupData | null> {
    const groupRow = this.db
      .prepare(`SELECT id, name, created_at FROM groups WHERE lower(name) = lower(?)`)
      .get(name) as any;

    if (!groupRow) {
      return null;
    }

    const members = this.getMembersForGroup(groupRow.id);

    return {
      id: groupRow.id,
      name: groupRow.name,
      members,
      createdAt: groupRow.created_at,
    };
  }

  public async findAll(): Promise<GroupData[]> {
    const rows = this.db
      .prepare(`SELECT id, name, created_at FROM groups ORDER BY created_at DESC`)
      .all() as any[];

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      members: this.getMembersForGroup(r.id),
      createdAt: r.created_at,
    }));
  }

  public async save(group: GroupData): Promise<void> {
    const saveTx = this.db.transaction(() => {
      this.db
        .prepare(
          `INSERT OR REPLACE INTO groups (id, name, created_at)
           VALUES (?, ?, ?)`
        )
        .run(group.id, group.name, group.createdAt);

      for (const member of group.members) {
        this.db
          .prepare(
            `INSERT OR IGNORE INTO members (id, name, created_at)
             VALUES (?, ?, ?)`
          )
          .run(member.id, member.name, member.createdAt);

        this.db
          .prepare(
            `INSERT OR IGNORE INTO group_members (group_id, member_id, joined_at)
             VALUES (?, ?, datetime('now'))`
          )
          .run(group.id, member.id);
      }
    });

    saveTx();
  }

  public async delete(id: string): Promise<void> {
    const deleteTx = this.db.transaction(() => {
      this.db.prepare("DELETE FROM group_members WHERE group_id = ?").run(id);
      this.db.prepare("DELETE FROM groups WHERE id = ?").run(id);
    });
    deleteTx();
  }

  public async addMember(groupId: string, member: MemberData): Promise<void> {
    const addTx = this.db.transaction(() => {
      this.db
        .prepare(
          `INSERT OR IGNORE INTO members (id, name, created_at)
           VALUES (?, ?, ?)`
        )
        .run(member.id, member.name, member.createdAt);

      this.db
        .prepare(
          `INSERT INTO group_members (group_id, member_id, joined_at)
           VALUES (?, ?, datetime('now'))`
        )
        .run(groupId, member.id);
    });

    addTx();
  }

  public async findMemberById(memberId: string): Promise<MemberData | null> {
    const row = this.db
      .prepare(`SELECT id, name, created_at FROM members WHERE id = ?`)
      .get(memberId) as any;

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
    };
  }

  private getMembersForGroup(groupId: string): MemberData[] {
    const rows = this.db
      .prepare(
        `SELECT m.id, m.name, m.created_at
         FROM members m
         JOIN group_members gm ON gm.member_id = m.id
         WHERE gm.group_id = ?
         ORDER BY m.name ASC`
      )
      .all(groupId) as any[];

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      createdAt: r.created_at,
    }));
  }
}
