
import mysql from 'mysql2/promise';
import { config } from '../config';
import { PageContent } from '../types';

const pool = mysql.createPool(config.db);

export async function getContent(): Promise<PageContent> {
    const connection = await pool.getConnection();
    try {
        const [globalRows] = await connection.query('SELECT * FROM global_content WHERE id = 1');
        const [uiRows] = await connection.query('SELECT * FROM ui_text WHERE id = 1');
        const [pagesRows] = await connection.query('SELECT * FROM pages_content');
        const [projectsRows] = await connection.query('SELECT * FROM projects ORDER BY display_order ASC');
        const [teamRows] = await connection.query('SELECT * FROM team_members ORDER BY display_order ASC');
        const [blogRows] = await connection.query('SELECT * FROM blog_posts ORDER BY date DESC');
        
        // This is a complex operation to fetch all activities and map them to their projects
        const allActivities = await connection.query('SELECT * FROM project_activities ORDER BY display_order ASC');
        const projects = (projectsRows as any[]).map(p => {
            return {
                ...p,
                activities: (allActivities[0] as any[]).filter(a => a.project_id === p.id)
            }
        });

        const pagesContent: any = {};
        (pagesRows as any[]).forEach(row => {
            pagesContent[row.page_name] = row.content;
        });

        return {
            global: (globalRows as any)[0],
            ui: (uiRows as any)[0].texts,
            homePage: pagesContent.homePage,
            aboutPage: pagesContent.aboutPage,
            projectsPage: pagesContent.projectsPage,
            projectDetailPage: pagesContent.projectDetailPage,
            teamPage: pagesContent.teamPage,
            blogPage: pagesContent.blogPage,
            contactPage: pagesContent.contactPage,
            donatePage: pagesContent.donatePage,
            projects,
            team: teamRows as any,
            blog: blogRows as any,
        };
    } finally {
        connection.release();
    }
}

export async function updateContent(content: PageContent): Promise<void> {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        // Update simple tables
        await connection.execute('UPDATE global_content SET ? WHERE id = 1', [content.global]);
        await connection.execute('UPDATE ui_text SET texts = ? WHERE id = 1', [JSON.stringify(content.ui)]);

        // Update pages
        for (const key of Object.keys(content).filter(k => k.endsWith('Page'))) {
            const pageKey = key as keyof PageContent;
            await connection.execute('UPDATE pages_content SET content = ? WHERE page_name = ?', [JSON.stringify((content as any)[pageKey]), pageKey]);
        }

        // Update complex lists (Projects, Team, Blog) - This is a simplified version.
        // A more robust solution would handle adds/deletes/updates individually.
        // For now, we clear and re-insert which is simpler but less efficient.
        
        // Projects and Activities
        await connection.execute('DELETE FROM project_activities');
        await connection.execute('DELETE FROM projects');
        for (const [index, project] of content.projects.entries()) {
            const { activities, ...projectData } = project;
            await connection.execute('INSERT INTO projects SET ?', [{...projectData, display_order: index}]);
            
            for(const [actIndex, activity] of activities.entries()) {
                 await connection.execute('INSERT INTO project_activities SET ?', [{...activity, project_id: project.id, display_order: actIndex}]);
            }
        }
        
        // Team Members
        await connection.execute('DELETE FROM team_members');
        for (const [index, member] of content.team.entries()) {
            await connection.execute('INSERT INTO team_members SET ?', [{...member, display_order: index}]);
        }

        // Blog Posts
        await connection.execute('DELETE FROM blog_posts');
        for (const post of content.blog) {
             await connection.execute('INSERT INTO blog_posts SET ?', [post]);
        }
        
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}