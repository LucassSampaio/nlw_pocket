import { lte, count, and, gte, eq, sql } from "drizzle-orm"
import { db } from "../db"
import { goalCompletions, goals } from "../db/schema"
import dayjs  from "dayjs";

export async function getWeekSummary(){
	const firstDayOfWeek = dayjs().startOf('week').toDate();
	const lastDayOfWeek = dayjs().endOf('week').toDate();

	const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
		db.select({
			id: goals.id,
			title: goals.title,
			desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
			creatAt: goals.createAt,
		}).from(goals)
		.where(lte(goals.createAt, lastDayOfWeek))
	)

	const goalsCompletedInWeek = db.$with('goals_completed_in-week').as(
		db.select({
			id: goalCompletions.id,
			title: goals.title,
			completedAt: goalCompletions.createdAt,
			completedAtDate: sql/*sql*/`
				DATE(${goalCompletions.createdAt})
			`.as('completedAtDate'),
		})
		.from(goalCompletions)
		.innerJoin(goals, eq(goals.id, goalCompletions.goalId))
		.where(
			and(
				gte(goalCompletions.createdAt, firstDayOfWeek),
				lte(goalCompletions.createdAt, lastDayOfWeek)
			)
		)
	)

	const goalsCompletedByWeekDay = db.$with('goals-completed-by-week-day').as(
		db
		.select({
			completedAtDate: goalsCompletedInWeek.completedAtDate,
			completions: sql/*sql*/`
				JSON_AGG(
					JSON_BUILD_OBJECT(
						'id', ${goalsCompletedInWeek.id},
						'title', ${goalsCompletedInWeek.title},
						'completedAt', ${goalsCompletedInWeek.completedAt}
						)
				)
			`.as('completions'),
		})
		.from(goalsCompletedInWeek)
		.groupBy(goalsCompletedInWeek.completedAtDate),
	)

	const result = await db
	.with(goalsCreatedUpToWeek, goalsCompletedInWeek, goalsCompletedByWeekDay)
	.select({
		completed: sql/*sql*/`
			(SELECT COUNT(*) FROM ${goalsCompletedInWeek})
		`.mapWith(Number),
		total: sql/*sql*/`
		(SELECT SUM(${goalsCreatedUpToWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToWeek})
		`.mapWith(Number),
		goalsPerDay: sql/*sql*/`
		JSON_OBJECT_AGG(
			${goalsCompletedByWeekDay.completedAtDate},
			${goalsCompletedByWeekDay.completions}
		)`
	})
	.from(goalsCompletedByWeekDay)

	return {
		summary: result,
	}
}
